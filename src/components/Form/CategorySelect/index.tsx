import React from "react";
import { View, Text } from "react-native";
import { Container, Category, Icon } from "./styles";

interface CategoryProps {
  title: string;
}

export function CategorySelect({ title }: CategoryProps) {
  return (
    <Container>
      <Category> {title}</Category>
      <Icon name="chevron-down" />
    </Container>
  );
}
