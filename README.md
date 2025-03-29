# chisq.py 

After data simulation, the following columns are required as inputs to fit the model using `HDDMStimCoding`:

| Column   | Meaning                                                       |
|----------|---------------------------------------------------------------|
| `rt`     | Reaction time (in seconds); can be `NaN` for no-go responses |
| `response` | Binary response (e.g., `0` = no-go, `1` = go)               |
| `stimulus` | Indicates the correct response condition (used in stim-coding) |
| `correct`  | Whether the subject made a correct response (`0` or `1`)    |
| `condition` | Task condition label (e.g., `0` or `1`)                    |
| `subj_idx` | Subject identifier (used to model individual differences)  |

