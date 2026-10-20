import { useSchema } from '../AdminApp.jsx';
import { Spinner } from '../ui.jsx';
import { SettingsForm } from './Settings.jsx';

export default function PageHeaders() {
  const schema = useSchema();
  if (!schema) return <Spinner />;
  const groups = schema.pages.map((p) => ({
    group: p.label,
    note: 'Leave a field blank to keep the website’s built-in text.',
    fields: schema.pageFields.map((f) => ({ ...f, name: `page.${p.key}.${f.name}` })),
  }));
  return <SettingsForm groups={groups} title="Page headers" description="The heading, introduction and scripture at the top of each page." />;
}
