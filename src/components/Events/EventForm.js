import React, { useState, useContext } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";
import {
  Grid,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import { useForm, Controller } from "react-hook-form";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {} from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import csc from "../../utils/csc";
import queryString from "query-string";
import tzdata from "tzdata";

import { AuthContext } from "../../auth/authContext";
import GoogleMapLocation from "./GoogleMapLocation";
import NewTag from "./NewTag";
import DeleteButton from "./DeleteButton";
import SameEventModal from "./SameEventModal";

const useStyles = makeStyles((theme) => ({
  buttonProgress: {
    color: "primary",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  form: {
    display: "block",
    textAlign: "center",
    "& .MuiTextField-root, .MuiButton-root": {
      display: "inline-block",
    },
  },
  formControl: {
    display: "flex",
  },
  searchInput: {
    flexGrow: "1",
  },
}));

const initDate = new Date();
initDate.setMinutes(0);

const EventForm = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const authContext = useContext(AuthContext);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [sameEventsName, setSameEventsName] = useState(null);
  const [subDataBuf, setSubDataBuf] = useState(null);

  const q = queryString.parse(location.search);
  let eventData = {
    name: q.name ? q.name : "",
    start_datetime: q.start_datetime ? new Date(q.start_datetime) : initDate,
    end_datetime: q.end_datetime ? new Date(q.end_datetime) : initDate,
    timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: q.url ? q.url : "",
    place: q.place ? q.place : "",
    country: "109",
    state: "",
    city: "",
    openness: "0",
    attendees: q.attendees ? q.attendees : 0,
    twitter_id: q.twitter_id ? q.twitter_id : "",
    organization_tag: [],
    character_tag: [],
    general_tag: [],
  };

  if (props.edit) {
    eventData = {
      ...props.events.find((el) => el.id.toString() === params.id),
    };
    if (eventData) {
      eventData.start_datetime = new Date(
        moment(eventData.start_datetime)
          .tz(eventData.timezone)
          .format("YYYY-MM-DDTHH:mm:ss")
      );
      eventData.end_datetime = new Date(
        moment(eventData.end_datetime)
          .tz(eventData.timezone)
          .format("YYYY-MM-DDTHH:mm:ss")
      );
      eventData.googleMapLocation = {
        description: eventData.google_map_description,
        place_id: eventData.google_map_place_id,
      };
    }
  }

  const {
    register,
    watch,
    handleSubmit,
    errors: formErrors,
    setError: setFormError,
    clearErrors,
    setValue,
    control,
  } = useForm({
    criteriaMode: "all",
    mode: "onChange",
    defaultValues: eventData,
  });

  const submitHandler = (data) => {
    setLoading(true);
    console.log(data.timezone);
    const postData = {
      ...data,
      start_datetime: moment
        .tz(
          moment(data.start_datetime).format("YYYY-MM-DDTHH:mm:ss"),
          data.timezone
        )
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss"),
      end_datetime: moment
        .tz(
          moment(data.end_datetime).format("YYYY-MM-DDTHH:mm:ss"),
          data.timezone
        )
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss"),
      google_map_place_id: data.googleMapLocation
        ? data.googleMapLocation.place_id
        : "",
      google_map_description: data.googleMapLocation
        ? data.googleMapLocation.description
        : "",
    };
    const url = props.edit ? "/events/" + params.id + "/" : "/events/";
    axios
      .request({
        method: props.edit ? "put" : "post",
        url: url,
        data: postData,
        headers: { Authorization: "Bearer " + authContext.token },
      })
      .then((response) => {
        const newEvents = [...props.events];
        if (props.edit) {
          newEvents[
            props.events.findIndex((el) => el.id === response.data.id)
          ] = response.data;
        } else {
          newEvents.push({ ...response.data, stars: 0, attends: 0 });
        }
        props.setEvents(newEvents);
        history.push("/events/" + response.data.id);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.data.message === "Same day event") {
            setSameEventsName(err.response.data.events_name);
            setSubDataBuf(data);
          } else {
            Object.entries(err.response.data).forEach(([key, value]) => {
              setFormError(key, { type: "manual", message: value });
            });
            setSameEventsName(null);
          }
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  };
  return (
    <>
      {sameEventsName && subDataBuf ? (
        <SameEventModal
          sameEventsName={sameEventsName}
          setSameEventsName={setSameEventsName}
          subDataBuf={subDataBuf}
          submitHandler={submitHandler}
        />
      ) : null}
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <DialogContent style={{ overflow: "visible" }}>
          <Grid container spacing={3} align="left">
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="name"
                label={t("common:form.event-name.label")}
                inputRef={register({
                  required: true,
                  maxLength: {
                    value: 255,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 255,
                      }
                    ),
                  },
                })}
                error={formErrors.name}
                helperText={formErrors.name ? formErrors.name.message : null}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="start_datetime"
                control={control}
                render={({ onChange, value }) => (
                  <KeyboardDateTimePicker
                    required
                    fullWidth
                    ampm={false}
                    format="yyyy/MM/dd HH:mm"
                    label={t("common:form.start-datetime.label")}
                    onChange={onChange}
                    onBlur={() => {
                      setValue("end_datetime", value);
                    }}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                as={KeyboardDateTimePicker}
                name="end_datetime"
                control={control}
                required
                fullWidth
                ampm={false}
                format="yyyy/MM/dd HH:mm"
                label={t("common:form.end-datetime.label")}
                minDate={watch("start_datetime")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl required variant="outlined" fullWidth>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ onChange, value }) => (
                    <Autocomplete
                      options={Object.keys(tzdata.zones)}
                      getOptionLabel={(option) => option}
                      onChange={(event, newValue) => {
                        onChange(newValue);
                      }}
                      value={value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("common:form.timezone.label")}
                          variant="outlined"
                        />
                      )}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl required variant="outlined" fullWidth>
                <InputLabel>{t("common:form.country.label")}</InputLabel>
                <Controller
                  name="country"
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      label={t("common:form.country.label-required")}
                      onChange={onChange}
                      value={value}
                    >
                      {csc.getAllCountries().map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl required variant="outlined" fullWidth>
                <InputLabel>{t("common:form.state.label")}</InputLabel>
                <Controller
                  name="state"
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      label={t("common:form.state.label-required")}
                      onChange={onChange}
                      value={value}
                    >
                      {csc.getStatesOfCountry(watch("country")).map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>{t("common:form.city.label")}</InputLabel>
                <Controller
                  name="city"
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      label={t("common:form.city.label-required")}
                      onChange={onChange}
                      value={value}
                    >
                      {csc.getCitiesOfState(watch("state")).map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="place"
                label={t("common:form.place.label")}
                inputRef={register({
                  maxLength: {
                    value: 255,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 255,
                      }
                    ),
                  },
                })}
                error={formErrors.place}
                helperText={formErrors.place ? formErrors.place.message : null}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="googleMapLocation"
                control={control}
                render={({ onChange, value }) => (
                  <GoogleMapLocation value={value} handler={onChange} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="attendees"
                type="number"
                label={t("common:form.attendees.label", {
                  temporaryPlacing: 0,
                })}
                inputRef={register({
                  required: true,
                  pattern: {
                    value: /^\d+?$/,
                    message: t("common:form.validations.min-integer.message", {
                      lowerLimit: 0,
                    }),
                  },
                  validate: (value) =>
                    value <= 2147483647 ||
                    t(
                      "common:form.validations.min-integer.error.input-is-too-large"
                    ),
                })}
                error={formErrors.attendees}
                helperText={
                  formErrors.attendees ? formErrors.attendees.message : null
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>{t("common:form.openness.label")}</InputLabel>
                <Controller
                  name="openness"
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      label={t("common:form.openness.label-required")}
                      onChange={onChange}
                      value={value}
                    >
                      <MenuItem value="0">
                        {t("common:enum.openness.open")}
                      </MenuItem>
                      <MenuItem value="1">
                        {t("common:enum.openness.friend_only")}
                      </MenuItem>
                      <MenuItem value="2">
                        {t("common:enum.openness.private")}
                      </MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="url"
                label={t("common:form.official_web_url.label")}
                inputRef={register({
                  maxLength: {
                    value: 255,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 255,
                      }
                    ),
                  },
                })}
                error={formErrors.url}
                helperText={formErrors.url ? formErrors.url.message : null}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="twitter_id"
                label={t("common:form.official_twitter_id.label")}
                inputRef={register({
                  maxLength: {
                    value: 255,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 255,
                      }
                    ),
                  },
                })}
                placeholder="twitter"
                error={formErrors.twitter_id}
                helperText={
                  formErrors.twitter_id ? formErrors.twitter_id.message : null
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="search_keywords"
                label={t("common:form.search-keywords.label")}
                inputRef={register({
                  maxLength: {
                    value: 255,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 255,
                      }
                    ),
                  },
                })}
                placeholder={t("common:form.search-keywords.placeholder")}
                error={formErrors.search_keywords}
                helperText={
                  formErrors.search_keywords
                    ? formErrors.search_keywords.message
                    : null
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={0} align="left">
                <Grid item xs={12} className={classes.formControl}>
                  <Controller
                    name="organization_tag"
                    control={control}
                    render={({ onChange, value }) => (
                      <Autocomplete
                        multiple
                        options={props.organizationTags}
                        getOptionLabel={(option) => option.name}
                        className={classes.searchInput}
                        onChange={(event, value) => {
                          onChange(value);
                        }}
                        value={value}
                        filterSelectedOptions
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              key={option.name}
                              label={option.name}
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
                            label={t("common:form.organization-tag.label")}
                            placeholder={t(
                              "common:form.organization-tag.placeholder"
                            )}
                          />
                        )}
                      />
                    )}
                  />
                  <NewTag
                    kind="organization"
                    tags={props.organizationTags}
                    setTags={props.setOrganizationTags}
                    tagValue={watch("organization_tag")}
                    tagHandler={(v) => setValue("organization_tag", v)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formControl}>
                  <Controller
                    name="character_tag"
                    control={control}
                    render={({ onChange, value }) => (
                      <Autocomplete
                        multiple
                        options={props.characterTags}
                        getOptionLabel={(option) => option.name}
                        className={classes.searchInput}
                        onChange={(event, value) => {
                          onChange(value);
                        }}
                        value={value}
                        filterSelectedOptions
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              key={option.name}
                              label={option.name}
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
                            label={t("common:form.character-tag.label")}
                            placeholder={t(
                              "common:form.character-tag.placeholder"
                            )}
                          />
                        )}
                      />
                    )}
                  />
                  <NewTag
                    kind="character"
                    tags={props.characterTags}
                    setTags={props.setCharacterTags}
                    tagValue={watch("character_tag")}
                    tagHandler={(v) => setValue("character_tag", v)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formControl}>
                  <Controller
                    name="general_tag"
                    control={control}
                    render={({ onChange, value }) => (
                      <Autocomplete
                        multiple
                        options={props.generalTags}
                        getOptionLabel={(option) => option.name}
                        className={classes.searchInput}
                        onChange={(event, value) => {
                          onChange(value);
                        }}
                        value={value}
                        filterSelectedOptions
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              key={option.name}
                              label={option.name}
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
                            label={t("common:form.general-tag.label")}
                            placeholder={t(
                              "common:form.general-tag.placeholder"
                            )}
                          />
                        )}
                      />
                    )}
                  />
                  <NewTag
                    kind="general"
                    tags={props.generalTags}
                    setTags={props.setGeneralTags}
                    tagValue={watch("general_tag")}
                    tagHandler={(v) => setValue("general_tag", v)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                name="description"
                label={t("common:form.event-detail.label")}
                inputRef={register({
                  maxLength: {
                    value: 1000,
                    message: t(
                      "common:form.validations.max-string-length.message",
                      {
                        maxLength: 1000,
                      }
                    ),
                  },
                })}
                error={formErrors.description}
                helperText={
                  formErrors.description ? formErrors.description.message : null
                }
              />
              <Typography align="center" color="error">
                {formErrors.non_field_errors
                  ? formErrors.non_field_errors.message
                  : null}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" color="error">
              {error}
            </Typography>
          </Grid>
        </DialogContent>
        <DialogActions>
          {props.edit && eventData ? (
            <>
              <DeleteButton
                id={params.id}
                events={props.events}
                setEvents={props.setEvents}
              />{" "}
            </>
          ) : null}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            onClick={() => clearErrors("non_field_errors")}
          >
            {props.edit
              ? t("common:ui.button.submit")
              : t("common:ui.button.create")}
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </Button>{" "}
          <Button
            onClick={props.handleClose}
            variant="contained"
            color="secondary"
            disabled={loading}
          >
            {t("common:ui.button.cancel")}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default EventForm;
