import type React from "react";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface ImageData {
  height: number;
  width: number;
  src: string;
  position?: "left" | "right";
}

interface FormNoticeProps {
  title?: React.ReactNode;
  body: React.ReactNode;
  type?: string;
  imageData?: ImageData;
  button?: React.ReactNode;
  align?: string;
  style?: React.CSSProperties;
  className?: string;
  iconClassName?: string;
}

export type FormNoticeType = React.ComponentType<FormNoticeProps> & {
  Types: Record<"PRIMARY" | "DANGER" | "WARNING" | "SUCCESS" | "BRAND" | "CUSTOM", string>;
};

const formNoticeStr = ".formNoticeTitle";

export default (await waitForModule(filters.bySource(formNoticeStr)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, formNoticeStr),
)) as FormNoticeType;
