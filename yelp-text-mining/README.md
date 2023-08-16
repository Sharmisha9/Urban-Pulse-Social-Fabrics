# Yelp, Relationships, & Geography

The original data must be downloaded from the [Yelp Open Dataset](https://www.yelp.com/dataset) as it is too big to upload to GitHub. The dataset is provided in JSON format, but you can use the [example code provided by Yelp](https://github.com/Yelp/dataset-examples/blob/master/json_to_csv_converter.py) to convert them to CSV. The only file you need from the dataset to run our analysis is `yelp_academic_dataset_review.csv` (after converting to CSV). Our file included here called `YelpChallengeWMetros_Clean.csv` is a cleaned version of `yelp_academic_dataset_business.csv` that you would get from downloading the dataset and running it through the converter.

The file `01-get-data-by-metro.ipynb` contains code for taking the raw reviews data and creating new files in the `small_reviews_urbcomp/` directory that divide the reviews by metro area for easier processing. Due to large file sizes, we only include the file for Boulder, CO (`yelp_academic_dataset_reviews_Boulder.csv`) in this repository.

The file `02-do-text-mining.ipynb` processes the reviews from the previous file and outputs raw relationship word counts in the `output_urbcomp/` directory.

The file `03-process-counts.ipynb` processes the raw word counts to get intermediate counts (including normalized counts) which are also stored in the `output_urbcomp/` directory.

The file `04-output-files.ipynb` outputs the final, fully processed results files as reflected in the paper. These files are located in the directory `final_output_urbcomp/` and include `all_counts_final_v2.csv` (unnormalized word counts per POI, for all metro areas), `all_counts_norm_final_v2.csv` (the normalized version of the previous file), and `num_businesses.csv` (for each relationship word, the number of POIs with at least one occurrence in their reviews).
