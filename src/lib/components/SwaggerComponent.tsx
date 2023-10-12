"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

interface SwaggerComponentProps {
  url: string;
}

const SwaggerComponent: React.FC<SwaggerComponentProps> = ({ url }) => {
  return <SwaggerUI url={url} />;
};

export default SwaggerComponent;
