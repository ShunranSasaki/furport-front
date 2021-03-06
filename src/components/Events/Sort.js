import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import { KeyboardDateTimePicker } from "@material-ui/pickers";

import { Autocomplete } from "@material-ui/lab";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginBottom: theme.spacing(4),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  formControl: {
    margin: theme.spacing(1),
    marginRight: theme.spacing(4),
    minWidth: 120,
  },
}));

export default function Sort(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);

  const handleChangeSort = (event) => {
    props.setSort(event.target.value);
  };

  useEffect(() => {
    if (
      props.organizationTagsQuery.length ||
      props.characterTagsQuery.length ||
      props.generalTagsQuery.length
    ) {
      setOpen(true);
    }
  }, [
    open,
    props.organizationTagsQuery.length,
    props.characterTagsQuery.length,
    props.generalTagsQuery.length,
  ]);

  return (
    <div className={classes.root}>
      <Accordion expanded={open}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => setOpen(!open)}
        >
          <Typography className={classes.heading}>
            {t("ソート・フィルター")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <FormControl className={classes.formControl}>
                <InputLabel>{t("ソート順")}</InputLabel>
                <Select value={props.sort} onChange={handleChangeSort}>
                  <MenuItem value="-start_datetime">
                    {t("開催日時が新しい順")}
                  </MenuItem>
                  <MenuItem value="start_datetime">
                    {t("開催日時が古い順")}
                  </MenuItem>
                  <MenuItem value="-stars">{t("スターが多い順")}</MenuItem>
                  <MenuItem value="-attends">{t("参加者が多い順")}</MenuItem>
                </Select>
              </FormControl>
              <KeyboardDateTimePicker
                ampm={false}
                format="yyyy/MM/dd HH:mm"
                label={t("いつから")}
                onChange={props.setSortStartDatetime}
                value={props.sortStartDatetime}
                showTodayButton
              />
              <KeyboardDateTimePicker
                ampm={false}
                format="yyyy/MM/dd HH:mm"
                label={t("いつまで")}
                onChange={props.setSortEndDatetime}
                value={props.sortEndDatetime}
                showTodayButton
              />
            </Grid>
            <Grid item sm={12}>
              {props.authenticated ? (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={props.filterStared}
                        onChange={() =>
                          props.setFilterStared(!props.filterStared)
                        }
                        color="primary"
                      />
                    }
                    label={t("スター付きのみ表示")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={props.filterAttended}
                        onChange={() =>
                          props.setFilterAttended(!props.filterAttended)
                        }
                        color="primary"
                      />
                    }
                    label={t("参加付きのみ表示")}
                  />
                </>
              ) : null}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={props.filterOld}
                    onChange={() => props.setFilterOld(!props.filterOld)}
                    color="primary"
                  />
                }
                label={t("過去のイベントを表示")}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={0} align="left">
                <Grid item xs={12} className={classes.formControl}>
                  <Autocomplete
                    multiple
                    options={props.organizationTags.map((el) => el.name)}
                    getOptionLabel={(option) => option}
                    className={classes.searchInput}
                    onChange={(event, value) => {
                      props.setOrganizationTagsQuery(value);
                    }}
                    value={props.organizationTagsQuery}
                    filterSelectedOptions
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                          style={{
                            color: "white",
                            backgroundColor: theme.palette.error.main,
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={t("主催者タグ")}
                        placeholder={t("タグフィルターを追加")}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formControl}>
                  <Autocomplete
                    multiple
                    options={props.characterTags.map((el) => el.name)}
                    getOptionLabel={(option) => option}
                    className={classes.searchInput}
                    onChange={(event, value) => {
                      props.setCharacterTagsQuery(value);
                    }}
                    value={props.characterTagsQuery}
                    filterSelectedOptions
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                          style={{
                            color: "white",
                            backgroundColor: theme.palette.primary.main,
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={t("キャラクタータグ")}
                        placeholder={t("タグフィルターを追加")}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formControl}>
                  <Autocomplete
                    multiple
                    options={props.generalTags.map((el) => el.name)}
                    getOptionLabel={(option) => option}
                    className={classes.searchInput}
                    onChange={(event, value) => {
                      props.setGeneralTagsQuery(value);
                    }}
                    value={props.generalTagsQuery}
                    filterSelectedOptions
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                          style={{
                            color: "white",
                            backgroundColor: theme.palette.secondary.main,
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={t("一般タグ")}
                        placeholder={t("タグフィルターを追加")}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
