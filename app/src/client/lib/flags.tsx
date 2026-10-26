// Country flags for the dashboards, keyed by the knowledge base's country ids.
// Only the markets the app covers are imported, so only those ship.

import flag_ar from 'flag-icons/flags/4x3/ar.svg';
import flag_bd from 'flag-icons/flags/4x3/bd.svg';
import flag_br from 'flag-icons/flags/4x3/br.svg';
import flag_cn from 'flag-icons/flags/4x3/cn.svg';
import flag_de from 'flag-icons/flags/4x3/de.svg';
import flag_es from 'flag-icons/flags/4x3/es.svg';
import flag_gb from 'flag-icons/flags/4x3/gb.svg';
import flag_id from 'flag-icons/flags/4x3/id.svg';
import flag_in from 'flag-icons/flags/4x3/in.svg';
import flag_jp from 'flag-icons/flags/4x3/jp.svg';
import flag_mx from 'flag-icons/flags/4x3/mx.svg';
import flag_ng from 'flag-icons/flags/4x3/ng.svg';
import flag_ph from 'flag-icons/flags/4x3/ph.svg';
import flag_pk from 'flag-icons/flags/4x3/pk.svg';
import flag_th from 'flag-icons/flags/4x3/th.svg';
import flag_tr from 'flag-icons/flags/4x3/tr.svg';
import flag_us from 'flag-icons/flags/4x3/us.svg';
import flag_uy from 'flag-icons/flags/4x3/uy.svg';
import flag_iq from 'flag-icons/flags/4x3/iq.svg';
import flag_za from 'flag-icons/flags/4x3/za.svg';
import flag_ae from 'flag-icons/flags/4x3/ae.svg';

const FLAGS: Record<string, string> = {
  argentina: flag_ar,
  bangladesh: flag_bd,
  brazil: flag_br,
  china: flag_cn,
  germany: flag_de,
  india: flag_in,
  indonesia: flag_id,
  japan: flag_jp,
  mexico: flag_mx,
  nigeria: flag_ng,
  pakistan: flag_pk,
  philippines: flag_ph,
  south_africa: flag_za,
  spain: flag_es,
  thailand: flag_th,
  turkey: flag_tr,
  united_kingdom: flag_gb,
  united_states: flag_us,
  uruguay: flag_uy,
  iraq: flag_iq,
  united_arab_emirates: flag_ae,
};

/** The flag image URL for a knowledge-base country id, if the app has one. */
export function flagSrc(country: string): string | undefined {
  return FLAGS[country];
}

/** A small flag for a knowledge-base country id; nothing for an unknown one. */
export function Flag({ country, label }: { country: string; label: string }) {
  const src = FLAGS[country];
  if (!src) return null;
  return <img src={src} alt={label} title={label} width={20} height={15} style={{ display: 'inline-block', border: '1px solid var(--neo-ink)', flex: 'none' }} />;
}
