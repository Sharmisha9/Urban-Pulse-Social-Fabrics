#include "ScalarFunction.hpp"
#include "utils.hpp"

#include <QFile>
#include <QTextStream>
#include <QDebug>
#include <iostream>

using namespace urbanpulse;
using namespace std;

ScalarFunction::ScalarFunction() {
    getFilters(this->filters);
    filterFns.resize(filters.size());
    cellSizeInMeters = getCellSizeInMeters();
}

void ScalarFunction::setBounds(QPointF leftBottom, QPointF rightTop) {
    lb = geo2world(leftBottom);
    rt = geo2world(rightTop);
    if(lb.x() > rt.x()) {
        double x = lb.x();
        lb.setX(rt.x());
        rt.setX(x);
    }
    if(lb.y() > rt.y()) {
        double y = lb.y();
        lb.setY(rt.y());
        rt.setY(y);
    }
    gres = getGroundResolution((leftBottom + rightTop) / 2);
    qDebug() << "getGroundResolution: " << gres;

    cellSize = cellSizeInMeters / gres;

    resx = std::ceil((rt.x() - lb.x()) / cellSize);
    resy = std::ceil((rt.y() - lb.y()) / cellSize);
    qDebug() << "resolution: " << resx << resy;
    regular.hourly = QVector<Function>(24,Function(resx,resy));
    regular.daily = QVector<Function>(7,Function(resx,resy));
    regular.monthly = QVector<Function>(12,Function(resx,resy));
    regular.all = Function(resx,resy);
    regular.name = "";

    for(int i = 0;i < filters.size();i ++) {
        filterFns[i].all = Function(resx,resy);
        filterFns[i].name = filters[i].name;

        switch(filters[i].ignoreRes) {
        case HourOfDay:
            filterFns[i].daily = QVector<Function>(7,Function(resx,resy));
            filterFns[i].monthly = QVector<Function>(12,Function(resx,resy));
            break;

        case DayOfWeek:
            filterFns[i].hourly = QVector<Function>(24,Function(resx,resy));
            filterFns[i].monthly = QVector<Function>(12,Function(resx,resy));
            break;

        case MonthOfYear:
            filterFns[i].hourly = QVector<Function>(24,Function(resx,resy));
            filterFns[i].daily = QVector<Function>(7,Function(resx,resy));
            break;
        }
    }
}

void ScalarFunction::setFunction(int fnType) {
    this->fnType = fnType;
}

void ScalarFunction::setSpatialIndex(int latIn, int lonIn) {
    this->latIn = latIn;
    this->lonIn = lonIn;
}

void ScalarFunction::setTemporalIndex(int timeIn) {
    this->timeIn = timeIn;
}

void ScalarFunction::addWeightedCount(Function &fn, QPointF pt, double val) {
    // TODO: hard coding values used in paper. add use parameter?
    float radius = 500 / gres;
    float cutoff = 100 / gres;

    int ncells = (int) std::ceil(radius / cellSize);
    
    // qDebug() << "nCells: " << ncells;

    int cx = (pt.x() - lb.x()) / cellSize;
    int cy = (pt.y() - lb.y()) / cellSize;

    qDebug() << "cx, cy: " << cx << cy;

    for(int x = cx - ncells; x <= cx + ncells; x++) {
        for(int y = cy - ncells; y <= cy + ncells; y++) {

            // qDebug() << "x, y: " << x << y;

            if(x < 0 || y < 0 || x >= resx || y >= resy) {
                continue;
            }
            QPointF center = lb + QPointF(cellSize * (x + 0.5),cellSize * (y + 0.5));
            double dist2 = QPointF::dotProduct(pt - center, pt - center);
            double wt = std::exp(-(dist2)/ (cutoff * cutoff));
            // qDebug() << "Printing Val: " << val;
            fn.addVal(x,y,val * wt,wt);
        }
    }
}

void ScalarFunction::generateFunctions(QString inputFile) {
    qDebug() << "generatinggggggg generateFunctions: " << inputFile;

    // read and organize the function at different resolutions and filters
    QFile fi(inputFile);
    if(!fi.open(QFile::ReadOnly | QIODevice::Text)) {
        qDebug() << "could not read input file: " << inputFile;
        exit(1);
    }
    QTextStream ip(&fi);
    // first line: header
    QStringList header = ip.readLine().split(",");
    if(fnType == 0) {
        fnName = "density";
    } else {
        fnName = header[fnType];
    }
    int ct = 0;
    while(!ip.atEnd()) {
        QStringList line = ip.readLine().split(",");
        if(line.size() == 0) {
            continue;
        }
        if(ct % 10000 == 0) {
            cerr << "\r" << "processed " << ct << " records";
        }
        ct ++;
        double lat = QString(line[latIn]).toDouble();
        double lon = QString(line[lonIn]).toDouble();

        QPointF coord = geo2world(QPointF(lat,lon));
        uint32_t etime = QString(line[timeIn]).toUInt();
        int hour = getTime(etime,tz,TimeResolutions::HourOfDay);
        int day = getTime(etime,tz,TimeResolutions::DayOfWeek);
        int month = getTime(etime,tz,TimeResolutions::MonthOfYear);

        double val = 0;
        if(this->fnType != 0) {
            val = QString(line[fnType]).toDouble();
        }

        // standard resolutions
        this->addWeightedCount(regular.all,coord,val);
        this->addWeightedCount(regular.hourly[hour],coord,val);
        this->addWeightedCount(regular.daily[day],coord,val);
        this->addWeightedCount(regular.monthly[month],coord,val);

        // filters
        for(int i = 0;i < filters.size();i ++) {
            int st = filters[i].aggRange.first;
            int en = filters[i].aggRange.second;
            bool inc;
            switch(filters[i].ignoreRes) {
            case HourOfDay:
                inc = false;
                if(en < st) {
                    if((hour >= st && hour < HourOfDay) || (hour >= 0 && hour < en)) {
                        inc = true;
                    }
                } else {
                    if(hour >= st && hour < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].daily[day],coord,val);
                    this->addWeightedCount(filterFns[i].monthly[month],coord,val);
                }
                break;

            case DayOfWeek:
                inc = false;
                if(en < st) {
                    if((day >= st && day < DayOfWeek) || (day >= 0 && day < en)) {
                        inc = true;
                    }
                } else {
                    if(day >= st && day < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].hourly[hour],coord,val);
                    this->addWeightedCount(filterFns[i].monthly[month],coord,val);
                }
                break;

            case MonthOfYear:
                inc = false;
                if(en < st) {
                    if((month >= st && month < MonthOfYear) || (month >= 0 && month < en)) {
                        inc = true;
                    }
                } else {
                    if(month >= st && month < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].hourly[hour],coord,val);
                    this->addWeightedCount(filterFns[i].daily[day],coord,val);
                }
                break;

            default:
                qDebug() << "should not come here";
                exit(1);
            }
        }
    }
    cerr << "\r finished generating functions" << endl;
    fi.close();
}

void ScalarFunction::writeFunction(QString fileName, Function &fn) {
    QFile fo(fileName);
    if(!fo.open(QFile::WriteOnly | QIODevice::Text)) {
        qDebug() << "could not write file: " << fileName;
        exit(1);
    }
    QTextStream op(&fo);
    op << resx << "," << resy << "\n";
    QPointF glb = world2geo(lb);
    QPointF grt = world2geo(rt);
//    op << qSetRealNumberPrecision(10) << glb.x() << "," << glb.y() << "," << grt.x() << "," << grt.y() << "\n\n";
    // Only for urban pulse desktop UI
    op << qSetRealNumberPrecision(10) << grt.x() << "," << glb.y() << "," << glb.x() << "," << grt.y() << "\n\n";

    fn.write(op, (fnType == 0));

    fo.close();

    qDebug() << "writing" << fileName;
}

void ScalarFunction::writeFunction(QString filePrefix, QVector<Function> &fn, QString fnName) {
    for(int i = 0;i < fn.size();i ++) {
        this->writeFunction(filePrefix + QString::number(i) + fnName + ".scalars", fn[i]);
    }
}

void ScalarFunction::setTimeZone(const QString &tzone) {
    tz = QTimeZone(tzone.toLatin1());
    qDebug() << "setting time zone" << tzone << tz << tz.isValid();
}

void ScalarFunction::writeFunctions(QString filePrefix, PulseFunction &fn) {
    this->writeFunction(filePrefix + "ALL_0" + fn.name + ".scalars", fn.all);
    this->writeFunction(filePrefix + getString(HourOfDay) + "_", fn.hourly, fn.name);
    this->writeFunction(filePrefix + getString(DayOfWeek) + "_", fn.daily, fn.name);
    this->writeFunction(filePrefix + getString(MonthOfYear) + "_", fn.monthly, fn.name);
}

void ScalarFunction::setDataName(const QString &name) {
    dataName = name;
}

void ScalarFunction::writeOutput(QString opFolder) {
    cerr << "writing default functions" << endl;
    this->writeFunctions(opFolder+"/"+dataName+"_", regular);
    for(int i = 0;i < filters.size();i ++) {
        cerr << "writing filter " << filters[i].name.toStdString() << endl;
        this->writeFunctions(opFolder+"/"+dataName+"_", filterFns[i]);
    }
}

Function::Function(int resx, int resy) {
    this->resx = resx;
    this->resy = resy;

    this->vals.resize(resx * resy);
}

// count is weight
void Function::addVal(int x, int y, double val, double count) {
    int in = getCellId(x,y);
    vals[in].count += count;
    vals[in].sum += val;
}

FunctionVal Function::getVal(int x, int y) {
    int in = getCellId(x,y);
    return vals[in];
}

int Function::getCellId(int x, int y) {
    return (x + y * resx);
}


void ScalarFunction::generateBusinesses() {
    QFile fi("/Users/vvsphani/projects/urban-pulse/vis/scripts/yelp_businesses.csv");
    if(!fi.open(QFile::ReadOnly | QIODevice::Text)) {
        qDebug() << "could not read input file: yelp_bus";
        exit(1);
    }
    int ct = 0;
    QTextStream ip(&fi);
    while (!ip.atEnd())
    {
        QStringList line = ip.readLine().split(",");
        if(line.size() == 0) {
            continue;
        }
        if(ct % 1000 == 0) {
            cerr << "\r" << "processed " << ct << " records";
        }
        ct++;
        double lat = QString(line[0]).toDouble();
        double lon = QString(line[1]).toDouble();
        QString bizId = QString(line[2]);
        QString bizName = QString(line[3]);


        QPointF coord = geo2world(QPointF(lat,lon));
        float radius = 500 / gres;
        float cutoff = 100 / gres;

        int ncells = (int) std::ceil(radius / cellSize);
        
        // qDebug() << "nCells: " << ncells;

        int cx = (coord.x() - lb.x()) / cellSize;
        int cy = (coord.y() - lb.y()) / cellSize;

        qDebug() << "resx" << resx;

        int cellId = (cx + cy * resx);

        QVector<QString> res;
        res.append(QString::number(cx));
        res.append(QString::number(cy));
        res.append(QString(line[0]));
        res.append(QString(line[1]));
        res.append(QString::number(cellId));
        res.append(bizId);
        res.append(bizName);

        qDebug() << "cx, cy: " << res[0] << res[1] << res;
        businessPoints.push_back(res);
        // qDebug() << "Business Points " << businessPoints;
    }
    // qDebug() << "Business Points " << businessPoints;
    cerr << "\r finished generating business locations" << endl;
    fi.close();


    QFile fo("/Users/vvsphani/projects/urban-pulse/vis/scripts/yelp_geo_coords.csv");
    if(!fo.open(QFile::WriteOnly | QIODevice::Text)) {
        qDebug() << "could not write file yelp_geo_coords: ";
        exit(1);
    }
    QTextStream op(&fo);

    for(int i = 0;i < businessPoints.size();i ++) {
        QVector<QString> coord = businessPoints[i];
        op << coord[0] << "," << coord[1] << "," << coord[2] << "," << coord[3] << "," << coord[4] << "," << coord[5] << "," << coord[6] << "\n";
    }
}


void Function::write(QTextStream &op, bool count) {

    for(int y = resy - 1;y >= 0;y --) {
        for(int x = 0;x < resx;x ++) {
            int in = getCellId(x,y);
            if(count) {
                op << qSetRealNumberPrecision(10) << vals[in].count << "\n";
            } else {
                op << qSetRealNumberPrecision(10) << (vals[in].sum / vals[in].count) << "\n";
            }
        }
    }
//    for(int i = 0;i < vals.size(); i++) {
//        if(count) {
//            op << qSetRealNumberPrecision(10) << vals[i].count << "\n";
//        } else {
//            op << qSetRealNumberPrecision(10) << (vals[i].sum / vals[i].count) << "\n";
//        }
//    }
}
