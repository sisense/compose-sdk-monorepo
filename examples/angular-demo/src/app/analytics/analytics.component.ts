import { Component } from '@angular/core';
import { measures } from '@sisense/sdk-data';
import type { Member } from '@sisense/sdk-ui';
import * as DM from '../../assets/sample-healthcare-model';

/**
 * This component showcases Compose SDK features.
 *
 * TBU
 */
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  allMembers: Member[] = [
    'Oncology',
    'Pediatrics',
    'Cardiology',
    'Emergency Room',
    'Operating Rooms',
    'Neurology',
  ].map((m) => ({
    key: m,
    title: m,
  }));

  selectedMembers: Member[] = ['Cardiology', 'Neurology'].map((m) => ({
    key: m,
    title: m,
  }));

  dimensions = [DM.Admissions.Admission_Time.Years];

  measures = [measures.count(DM.Admissions.Patient_ID)];
}
