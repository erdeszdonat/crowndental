export type NfcCardMetrics = {
  id: string;
  views: number;
  visitors: number;
  sessions: number;
  starts: number;
  requests: number;
  confirmed: number;
  cancelled: number;
  measuredRequests: number;
  bookedSessions: number;
  engagementMs: number;
  phoneClicks: number;
};
export type NfcReport = {
  range: { from: string; to: string };
  cards: NfcCardMetrics[];
  treatments: {
    card_id: string;
    treatment: string;
    requests: number;
    confirmed: number;
  }[];
  hygienists: { id: string | null; requests: number; confirmed: number }[];
};
export const nfcConversion = (card: NfcCardMetrics) =>
  card.sessions > 0 ? (card.bookedSessions / card.sessions) * 100 : null;
