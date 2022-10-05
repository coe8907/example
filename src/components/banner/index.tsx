import React, { useState, useCallback, useEffect } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Slide from "@mui/material/Slide";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";

import { useApiCall } from "../../hooks/useApiCall";
import type { Api, ApiResponse, BannerMessages } from "../../types";

export type HealthyProps = {
  config: HealthyConfig;
};

export type HealthyConfig = {
  /** An array of API objects */
  apis: Api[];
  /** A callback that's called after the component handles the error, for additional error handling */
  onError?: (api: ApiResponse) => void;
  /** The interval at which to call the APIs in milliseconds; default is 30 seconds (30000) */
  interval?: number;
  /** CSS class names to assign to the banner, banner content, and close button */
  classes?: {
    banner?: string;
    content?: string;
    closeButton?: string;
  };
  messages?: BannerMessages;
  /** Whether or not to show a close icon - default is false */
  closeable?: boolean;
};

export function Healthy({ config }: HealthyProps) {
  const [checked, setChecked] = React.useState(false);
  const {
    apis,
    onError,
    interval = undefined,
    classes = undefined,
    closeable = false,
    messages,
  } = config;
  const [showBanner, setShowBanner] = useState(true);

  const { pageHasError, apisWithErrors } = useApiCall({
    apis,
    interval,
    onError,
  });

  useEffect(() => {
    setShowBanner(pageHasError);
  }, [pageHasError]);

  const generate = (element: React.ReactElement) => {
    return [0, 1, 2].map((value) =>
      React.cloneElement(element, {
        key: value,
      })
    );
  };

  const determineMessage = useCallback(() => {
    if (!apisWithErrors.length) return;

    // single issue
    if (apisWithErrors.length === 1) {
      const downApi = apisWithErrors.values().next().value;
      const defaultMessage = `We are currently experiencing issues with our ${downApi.name} service`;

      return messages?.singleError || defaultMessage;
    }

    // multiple issues
    return (
      messages?.multipleErrors ||
      "We are currently experiencing issues with our services"
    );
  }, [messages, apisWithErrors]);

  const bannerMessage = determineMessage();

  return showBanner ? (
    <Alert severity="error" onClick={() => setChecked(!checked)}>
      <AlertTitle>{bannerMessage}</AlertTitle>
      {checked && (
          <List>
            {generate(
              <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
              <ListItem>
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText primary="show api name" />
              </ListItem>
              </Slide>
            )}
          </List>
      )}
    </Alert>
  ) : null;
}

export default Healthy;
