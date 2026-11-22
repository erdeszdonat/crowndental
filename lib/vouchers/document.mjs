import { createHash } from 'node:crypto';
import layout from '../../prototypes/karacsonyi-utalvanyok/voucher.js';

const templateDigest =
  '76f68d408199ed050e572630db2c14c1dfc6184650742298eb7ce1a76dd76e1c';
export async function voucherDocument(pdf, template, order, sample) {
  if (createHash('sha256').update(template).digest('hex') !== templateDigest)
    throw new Error('voucher_template_mismatch');
  return Buffer.from(await layout.render(pdf, template, order, sample));
}
