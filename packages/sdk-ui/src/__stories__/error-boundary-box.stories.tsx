import ErrorBoundaryBox from '../infra/error-boundary/error-boundary-box';
import { templateForComponent } from './template';

const template = templateForComponent(ErrorBoundaryBox);

export default {
  title: 'Errors/ErrorBoundaryBox',
  component: ErrorBoundaryBox,
};

export const regular = template({ error: '' });

export const customMessage = template({ error: 'A defined error has been encountered' });
