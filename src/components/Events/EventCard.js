import React, { useState, useEffect } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TodayIcon from "@material-ui/icons/Today";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import csc from "country-state-city";

import Tag from "./Tag";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    margin: theme.spacing(1),
  },
  media: {
    height: 140,
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
  iconText: {
    display: "inline-flex",
    verticalAlign: "middle",
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

export default function EventCard(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "/events/";
    axios
      .get(url)
      .then((response) => {
        setEvents(response.data.results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {!loading ? (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card className={classes.root}>
                <Link to={"/events/" + event.id} className={classes.link}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {event.name}
                      </Typography>
                      <div>
                        <div className={classes.iconText}>
                          <TodayIcon className={classes.icon} />
                          <Typography>
                            {new Date(
                              event.start_datetime
                            ).toLocaleDateString() ===
                            new Date(event.end_datetime).toLocaleDateString()
                              ? new Date(
                                  event.start_datetime
                                ).toLocaleDateString()
                              : new Date(
                                  event.start_datetime
                                ).toLocaleDateString() +
                                " 〜 " +
                                new Date(
                                  event.end_datetime
                                ).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                      <div>
                        <div className={classes.iconText}>
                          <LocationOnIcon className={classes.icon} />
                          <Typography>
                            {t(
                              csc.getCountryById(event.country.toString()).name
                            ) +
                              " " +
                              t(csc.getStateById(event.state.toString()).name)}
                          </Typography>
                        </div>
                      </div>
                      <Tag tags={event.general_tag} />
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
      {error}
    </>
  );
}
