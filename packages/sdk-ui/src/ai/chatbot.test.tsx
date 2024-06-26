import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { Chatbot } from './chatbot';
import { AiTestWrapper } from './__mocks__';
import { http, HttpResponse } from 'msw';
import { contexts } from './__mocks__/data';

beforeEach(() => {
  server.use(http.get('*/api/datasources', () => HttpResponse.json(contexts)));
});

it('renders chatbot with the correct default dimensions', async () => {
  const { container } = setup(
    <AiTestWrapper>
      <Chatbot />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());

  expect(container.firstChild).toHaveStyle({
    minWidth: '500px',
    minHeight: '500px',
    width: '500px',
    height: '900px',
  });
});

it('renders chatbot with the mininum allowed dimensions', async () => {
  const { container } = setup(
    <AiTestWrapper>
      <Chatbot width="100px" height="50px" />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());

  expect(container.firstChild).toHaveStyle({
    minWidth: '500px',
    minHeight: '500px',
  });
});

it('renders chatbot with custom, valid dimensions', async () => {
  const { container } = setup(
    <AiTestWrapper>
      <Chatbot width="700px" height="800px" />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());

  expect(container.firstChild).toHaveStyle({
    minWidth: '500px',
    minHeight: '500px',
    width: '700px',
    height: '800px',
  });
});
