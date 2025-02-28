import type React from "react";
import { Divider, FormText } from ".";
import { filters, waitForModule } from "../webpack";

interface FormItemCompProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "label" | "legend";
  titleClassName?: string;
}

type FormItemCompType = React.ComponentType<FormItemCompProps>;

const formItemStr =
  '"children","disabled","className","titleClassName","tag","required","style","title","error"';

const FormItemComp = (await waitForModule(filters.bySource(formItemStr)).then((mod) =>
  Object.values(mod).find((x) => x?.render?.toString()?.includes(formItemStr)),
)) as FormItemCompType;

const classes = await waitForModule<Record<"dividerDefault", string>>(filters.byProps("labelRow"));

interface FormItemProps extends FormItemCompProps {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
}

export type FormItemType = React.FC<FormItemProps>;

export default ((props) => {
  const { note, notePosition = "before", noteStyle, noteClassName, divider, ...compProps } = props;
  return (
    <FormItemComp {...compProps}>
      {note && notePosition === "before" && (
        <FormText.DESCRIPTION
          disabled={props.disabled}
          className={noteClassName}
          style={{ marginBottom: 8, ...noteStyle }}>
          {note}
        </FormText.DESCRIPTION>
      )}
      {props.children}
      {note && notePosition === "after" && (
        <FormText.DESCRIPTION
          disabled={props.disabled}
          className={noteClassName}
          style={{ marginTop: 8, ...noteStyle }}>
          {note}
        </FormText.DESCRIPTION>
      )}
      {divider && <Divider className={classes.dividerDefault} />}
    </FormItemComp>
  );
}) as FormItemType;
