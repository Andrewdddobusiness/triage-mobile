import { createFieldScreen } from "~/lib/screens/FieldScreenFactory";

export default createFieldScreen({
  title: "Business email",
  columnKey: "business_email",
  type: "email",
  placeholder: "you@business.com",
});
