import {
  Dimension,
  DateDimension,
  Attribute,
  createAttribute,
  createDateDimension,
  createDimension,
} from '@sisense/sdk-data';

export const DataSource = 'Sample Healthcare';

interface AdmissionsDimension extends Dimension {
  Cost_of_admission: Attribute;
  Death: Attribute;
  Diagnosis_ID: Attribute;
  Doctor_ID: Attribute;
  HAI: Attribute;
  ID: Attribute;
  Patient_ID: Attribute;
  Room_ID: Attribute;
  SSI: Attribute;
  Surgical_Procedure: Attribute;
  TimeofStay: Attribute;
  Admission_Time: DateDimension;
  Discharge_Time: DateDimension;
}
export const Admissions = createDimension({
  name: 'Admissions',
  Cost_of_admission: createAttribute({
    name: 'Cost_of_admission',
    type: 'numeric-attribute',
    expression: '[Admissions.Cost_of_admission]',
  }),
  Death: createAttribute({
    name: 'Death',
    type: 'text-attribute',
    expression: '[Admissions.Death]',
  }),
  Diagnosis_ID: createAttribute({
    name: 'Diagnosis_ID',
    type: 'numeric-attribute',
    expression: '[Admissions.Diagnosis_ID]',
  }),
  Doctor_ID: createAttribute({
    name: 'Doctor_ID',
    type: 'numeric-attribute',
    expression: '[Admissions.Doctor_ID]',
  }),
  HAI: createAttribute({
    name: 'HAI',
    type: 'text-attribute',
    expression: '[Admissions.HAI]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Admissions.ID]',
  }),
  Patient_ID: createAttribute({
    name: 'Patient_ID',
    type: 'numeric-attribute',
    expression: '[Admissions.Patient_ID]',
  }),
  Room_ID: createAttribute({
    name: 'Room_ID',
    type: 'numeric-attribute',
    expression: '[Admissions.Room_ID]',
  }),
  SSI: createAttribute({
    name: 'SSI',
    type: 'text-attribute',
    expression: '[Admissions.SSI]',
  }),
  Surgical_Procedure: createAttribute({
    name: 'Surgical_Procedure',
    type: 'text-attribute',
    expression: '[Admissions.Surgical_Procedure]',
  }),
  TimeofStay: createAttribute({
    name: 'TimeofStay',
    type: 'numeric-attribute',
    expression: '[Admissions.Time of Stay]',
  }),
  Admission_Time: createDateDimension({
    name: 'Admission_Time',
    expression: '[Admissions.Admission_Time (Calendar)]',
  }),
  Discharge_Time: createDateDimension({
    name: 'Discharge_Time',
    expression: '[Admissions.Discharge_Time (Calendar)]',
  }),
}) as AdmissionsDimension;

interface ConditionstimeofstayDimension extends Dimension {
  Average_time_of_stay: Attribute;
  ID: Attribute;
  Negative: Attribute;
  Positive: Attribute;
}
export const Conditionstimeofstay = createDimension({
  name: 'Conditions time of stay',
  Average_time_of_stay: createAttribute({
    name: 'Average_time_of_stay',
    type: 'numeric-attribute',
    expression: '[Conditions time of stay.Average_time_of_stay]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Conditions time of stay.ID]',
  }),
  Negative: createAttribute({
    name: 'Negative',
    type: 'numeric-attribute',
    expression: '[Conditions time of stay.Negative]',
  }),
  Positive: createAttribute({
    name: 'Positive',
    type: 'numeric-attribute',
    expression: '[Conditions time of stay.Positive]',
  }),
}) as ConditionstimeofstayDimension;

interface DiagnosisDimension extends Dimension {
  Description: Attribute;
  ID: Attribute;
}
export const Diagnosis = createDimension({
  name: 'Diagnosis',
  Description: createAttribute({
    name: 'Description',
    type: 'text-attribute',
    expression: '[Diagnosis.Description]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Diagnosis.ID]',
  }),
}) as DiagnosisDimension;

interface DivisionsDimension extends Dimension {
  Divison_name: Attribute;
  ID: Attribute;
}
export const Divisions = createDimension({
  name: 'Divisions',
  Divison_name: createAttribute({
    name: 'Divison_name',
    type: 'text-attribute',
    expression: '[Divisions.Divison_name]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Divisions.ID]',
  }),
}) as DivisionsDimension;

interface DoctorsDimension extends Dimension {
  Division_ID: Attribute;
  FullName: Attribute;
  ID: Attribute;
  Name: Attribute;
  Specialty: Attribute;
  Surname: Attribute;
}
export const Doctors = createDimension({
  name: 'Doctors',
  Division_ID: createAttribute({
    name: 'Division_ID',
    type: 'numeric-attribute',
    expression: '[Doctors.Division_ID]',
  }),
  FullName: createAttribute({
    name: 'FullName',
    type: 'text-attribute',
    expression: '[Doctors.Full Name]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Doctors.ID]',
  }),
  Name: createAttribute({
    name: 'Name',
    type: 'text-attribute',
    expression: '[Doctors.Name]',
  }),
  Specialty: createAttribute({
    name: 'Specialty',
    type: 'text-attribute',
    expression: '[Doctors.Specialty]',
  }),
  Surname: createAttribute({
    name: 'Surname',
    type: 'text-attribute',
    expression: '[Doctors.Surname]',
  }),
}) as DoctorsDimension;

interface ERDimension extends Dimension {
  Diagnosis_ID: Attribute;
  ID: Attribute;
  Patient_ID: Attribute;
  Waitingtime: Attribute;
  Attendance_time: DateDimension;
  Check_in_time: DateDimension;
  Date: DateDimension;
}
export const ER = createDimension({
  name: 'ER',
  Diagnosis_ID: createAttribute({
    name: 'Diagnosis_ID',
    type: 'numeric-attribute',
    expression: '[ER.Diagnosis_ID]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[ER.ID]',
  }),
  Patient_ID: createAttribute({
    name: 'Patient_ID',
    type: 'numeric-attribute',
    expression: '[ER.Patient_ID]',
  }),
  Waitingtime: createAttribute({
    name: 'Waitingtime',
    type: 'numeric-attribute',
    expression: '[ER.Waiting time]',
  }),
  Attendance_time: createDateDimension({
    name: 'Attendance_time',
    expression: '[ER.Attendance_time (Calendar)]',
  }),
  Check_in_time: createDateDimension({
    name: 'Check_in_time',
    expression: '[ER.Check_in_time (Calendar)]',
  }),
  Date: createDateDimension({
    name: 'Date',
    expression: '[ER.Date (Calendar)]',
  }),
}) as ERDimension;

interface PatientsDimension extends Dimension {
  DOB: Attribute;
  FullName: Attribute;
  Gender: Attribute;
  ID: Attribute;
  Name: Attribute;
  Surname: Attribute;
}
export const Patients = createDimension({
  name: 'Patients',
  DOB: createAttribute({
    name: 'DOB',
    type: 'text-attribute',
    expression: '[Patients.DOB]',
  }),
  FullName: createAttribute({
    name: 'FullName',
    type: 'text-attribute',
    expression: '[Patients.Full Name]',
  }),
  Gender: createAttribute({
    name: 'Gender',
    type: 'text-attribute',
    expression: '[Patients.Gender]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Patients.ID]',
  }),
  Name: createAttribute({
    name: 'Name',
    type: 'text-attribute',
    expression: '[Patients.Name]',
  }),
  Surname: createAttribute({
    name: 'Surname',
    type: 'text-attribute',
    expression: '[Patients.Surname]',
  }),
}) as PatientsDimension;

interface RoomsDimension extends Dimension {
  Bed_count: Attribute;
  Division_ID: Attribute;
  ID: Attribute;
  Room_number: Attribute;
}
export const Rooms = createDimension({
  name: 'Rooms',
  Bed_count: createAttribute({
    name: 'Bed_count',
    type: 'numeric-attribute',
    expression: '[Rooms.Bed_count]',
  }),
  Division_ID: createAttribute({
    name: 'Division_ID',
    type: 'numeric-attribute',
    expression: '[Rooms.Division_ID]',
  }),
  ID: createAttribute({
    name: 'ID',
    type: 'numeric-attribute',
    expression: '[Rooms.ID]',
  }),
  Room_number: createAttribute({
    name: 'Room_number',
    type: 'numeric-attribute',
    expression: '[Rooms.Room_number]',
  }),
}) as RoomsDimension;
