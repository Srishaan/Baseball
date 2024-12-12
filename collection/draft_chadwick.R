library(baseballr)
library(tidyverse)

# Collect the draft information
draft_list <- list()

# Get the mlb_draft data for each year
for (season in c(1965:2023)) {
  draft_list[[as.character(season)]] <- mlb_draft(year = season)
  Sys.sleep(5) 
}

draft_df <- bind_rows(draft_list)
View(draft_df)

# write_csv(draft_df, 'draft_data.csv')

# Collect the Chadwick Bureau player information
chadwick_data <- chadwick_player_lu()
View(chadwick_data)

# write_csv(chadwick_data, 'chadwick_data.csv')
