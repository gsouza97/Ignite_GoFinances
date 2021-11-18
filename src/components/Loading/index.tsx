import React from "react";
import { ActivityIndicator } from "react-native";
import { LoadingContainer } from "./styles";
import { useTheme } from "styled-components";

export function Loading() {
  const theme = useTheme();

  return (
    <LoadingContainer>
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </LoadingContainer>
  );
}
