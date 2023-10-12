"use client";

import { RedocStandalone } from "redoc";

interface RedoclyComponentProps {
  url: string;
}

const RedoclyComponent: React.FC<RedoclyComponentProps> = ({ url }) => {
  return <RedocStandalone specUrl={url} />;
};

export default RedoclyComponent;
