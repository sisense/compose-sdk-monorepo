import type { NarrativeData } from '../types.js';

/**
 * Fixed timestamp so stories and snapshots stay deterministic.
 * @internal
 */
const GENERATED_AT = '2026-06-02T14:53:00Z';

/**
 * Standard-density narrative: an overview plus the maximum of three insights, one per status. Wording
 * mirrors the reference design over the Sample Healthcare data.
 * @internal
 */
export const mockNarrativeStandard: NarrativeData = {
  overview:
    'April 2013 drove the year — average length of stay spiked to **30 days** and total cost climbed ' +
    '**301%** to **$5.9M**, even as average admission cost fell **19.7%** to **$587K**.',
  insights: [
    {
      status: 'positive',
      text: 'Average length of stay rose to **11.4 days**, up **+128%** year over year.',
    },
    {
      status: 'negative',
      text: 'Total cost jumped to **$5.9M**, concentrated in high-cost cases like Dizziness at **$1.22M**.',
    },
    {
      status: 'neutral',
      text: 'Top diagnosis by volume is Broken Bone at **1** patient.',
    },
  ],
  generatedAt: GENERATED_AT,
  copyText:
    'April 2013 drove the year — average length of stay spiked to **30 days** and total cost climbed ' +
    '**301%** to **$5.9M**, even as average admission cost fell **19.7%** to **$587K**.\n\n' +
    '🟢 Average length of stay rose to **11.4 days**, up **+128%** year over year.\n' +
    '🔴 Total cost jumped to **$5.9M**, concentrated in high-cost cases like Dizziness at **$1.22M**.\n' +
    '⚪ Top diagnosis by volume is Broken Bone at **1** patient.',
};

/**
 * Standard-density narrative with two insights, covering the "up to three" case.
 * @internal
 */
export const mockNarrativeTwoInsights: NarrativeData = {
  overview:
    'Admissions concentrate in a single quarter while cost per case moves in the opposite direction ' +
    'across the same period.',
  insights: [
    {
      status: 'negative',
      text: 'Total cost climbed **301%**, reaching **$5.9M** by period end.',
    },
    {
      status: 'neutral',
      text: 'Admissions split evenly across **5** divisions.',
    },
  ],
  generatedAt: GENERATED_AT,
  copyText:
    'Admissions concentrate in a single quarter while cost per case moves in the opposite direction ' +
    'across the same period.\n\n' +
    '🔴 Total cost climbed **301%**, reaching **$5.9M** by period end.\n' +
    '⚪ Admissions split evenly across **5** divisions.',
};

/**
 * Low-density narrative: a short summary, an empty insight list — a normal outcome, not a degraded
 * state. Wording comes from a real generated response over the Sample Healthcare data.
 * @internal
 */
export const mockNarrativeLowDensity: NarrativeData = {
  overview:
    'Cardiology has the highest count of Patient ID at **186**, indicating it may have the largest ' +
    'patient volume among the divisions. Pediatrics has the lowest count at **159**, suggesting ' +
    'relatively fewer patients compared to other divisions.',
  insights: [],
  generatedAt: GENERATED_AT,
  copyText:
    'Cardiology has the highest count of Patient ID at **186**, indicating it may have the largest ' +
    'patient volume among the divisions. Pediatrics has the lowest count at **159**, suggesting ' +
    'relatively fewer patients compared to other divisions.',
};

/**
 * Oversized narrative for exercising in-widget scrolling and text wrapping.
 * @internal
 */
export const mockNarrativeOverflow: NarrativeData = {
  overview:
    'Across the observed period the dashboard shows admissions concentrating into a narrow window ' +
    'while cost measures move independently of volume, and the division breakdown stays broadly ' +
    'even rather than converging on any single specialty. Diagnosis ranking shifts between adjacent ' +
    'months without a stable leader, and length of stay tracks neither admission volume nor cost. ' +
    'The composition of high-cost cases changes more than their total, which accompanies a widening ' +
    'gap between typical and peak admission cost over the same months.',
  insights: [
    {
      status: 'positive',
      text: 'Average length of stay rose to **11.4 days**, up **+128%** year over year across all divisions.',
    },
    {
      status: 'negative',
      text: 'Total cost jumped to **$5.9M**, concentrated in high-cost cases such as Dizziness at **$1.22M**.',
    },
    {
      status: 'neutral',
      text: 'Top diagnosis by volume is Broken Bone, ahead of Bypass and Cough at **$315K** and **$278K**.',
    },
  ],
  generatedAt: GENERATED_AT,
  copyText: 'Oversized narrative fixture — see overview and insights.',
};
