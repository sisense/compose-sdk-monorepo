import { templateForComponent } from './template';
import ErrorBoundaryBox from '../error-boundary/error-boundary-box';

const template = templateForComponent(ErrorBoundaryBox);

export default {
  title: 'Errors/ErrorBoundaryBox',
  component: ErrorBoundaryBox,
};

export const regular = template({});

export const customMessage = template({ errorText: 'A defined error has been encountered' });
