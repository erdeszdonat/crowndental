import { defineField, defineType } from "sanity";
import {
  TEAM_LEAD_ID,
  TEAM_LOCALES,
  TEAM_ROLES,
  TEAM_ROLE_LABELS,
} from "../../lib/team";
const localized = (name: string, title: string, multiline = false) =>
  defineField({
    name,
    title,
    type: "object",
    fields: TEAM_LOCALES.map((locale) =>
      defineField({
        name: locale,
        title: { hu: "Magyar", en: "Angol", sk: "Szlovák", de: "Német" }[
          locale
        ],
        type: multiline ? "text" : "string",
        ...(multiline ? { rows: 5 } : {}),
        validation: (rule) => rule.max(multiline ? 5000 : 160),
      }),
    ),
  });
export const teamMemberType = defineType({
  name: "crownTeamMember",
  title: "Kollégáink",
  type: "document",
  liveEdit: true,
  initialValue: { role: "dentist", displayOrder: 0, isVisible: false },
  description:
    "A mentett adatlap csak a Megjelenik a weboldalon kapcsoló bekapcsolásakor lesz nyilvános. A weboldal legfeljebb 5 percen belül követi a Studio módosításait.",
  fields: [
    defineField({
      name: "name",
      title: "Teljes név",
      type: "string",
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: "role",
      title: "Munkakör",
      type: "string",
      options: {
        list: TEAM_ROLES.map((value) => ({
          title: TEAM_ROLE_LABELS[value],
          value,
        })),
      },
      validation: (rule) =>
        rule.required().custom((role, context) => {
          const id = context.document?._id?.replace(/^drafts\./, "");
          return (role === "professional_lead") === (id === TEAM_LEAD_ID)
            ? true
            : "A szakmai vezetőt a bal oldali külön Szakmai vezető menüpontban szerkessze.";
        }),
    }),
    localized("title", "Szakterület / megnevezés"),
    localized("bio", "Bemutatkozás", true),
    defineField({
      name: "photo",
      title: "Portréfotó",
      type: "image",
      options: { hotspot: true },
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.isVisible && !value?.asset
            ? "A nyilvános adatlaphoz fénykép szükséges."
            : true,
        ),
    }),
    defineField({
      name: "displayOrder",
      title: "Sorrend a csoporton belül",
      type: "number",
      validation: (rule) => rule.required().integer().min(0).max(9999),
    }),
    defineField({
      name: "isVisible",
      title: "Megjelenik a weboldalon",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Megjelenési sorrend",
      name: "displayOrder",
      by: [
        { field: "displayOrder", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      role: "role",
      visible: "isVisible",
      media: "photo",
    },
    prepare: ({ title, role, visible, media }) => ({
      title,
      subtitle: `${TEAM_ROLE_LABELS[role as keyof typeof TEAM_ROLE_LABELS] || ""} · ${visible ? "Nyilvános" : "Rejtett"}`,
      media,
    }),
  },
});
