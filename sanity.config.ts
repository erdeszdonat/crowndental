"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { TEAM_LEAD_ID, TEAM_TYPE } from "./lib/team";
import BlogSeoMaintenanceTool from "./sanity/tools/BlogSeoMaintenanceTool";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    ...schema,
    templates: (templates) => [
      ...templates,
      {
        id: "team-lead",
        title: "Szakmai vezető",
        schemaType: TEAM_TYPE,
        value: { role: "professional_lead", isVisible: false, displayOrder: 0 },
      },
    ],
  },
  document: {
    actions: (actions, context) =>
      context.documentId === TEAM_LEAD_ID
        ? actions.filter((action) => action.action !== "duplicate")
        : actions,
    newDocumentOptions: (options) =>
      options.filter((option) => option.templateId !== "team-lead"),
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Tartalmak")
          .items([
            S.listItem()
              .title("Szakmai vezető")
              .child(
                S.document()
                  .schemaType(TEAM_TYPE)
                  .documentId(TEAM_LEAD_ID)
                  .initialValueTemplate("team-lead"),
              ),
            S.listItem()
              .title("Kollégáink")
              .child(
                S.documentTypeList(TEAM_TYPE)
                  .title("Kollégáink")
                  .filter("_type == $type && _id != $lead && _id != $draftLead")
                  .params({
                    type: TEAM_TYPE,
                    lead: TEAM_LEAD_ID,
                    draftLead: `drafts.${TEAM_LEAD_ID}`,
                  }),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== TEAM_TYPE,
            ),
          ]),
    }),
  ],
  tools: [
    {
      name: "blog-seo-maintenance",
      title: "Blog SEO-karbantartás",
      component: BlogSeoMaintenanceTool,
    },
  ],
});
