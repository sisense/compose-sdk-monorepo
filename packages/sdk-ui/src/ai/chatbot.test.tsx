import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { Chatbot } from './chatbot';
import { MockApiWrapper } from './__mocks__';
import { http, HttpResponse } from 'msw';
import { dataModels, perspectives } from './__mocks__/data';

beforeEach(() => {
  server.use(
    http.get('*/api/v2/datamodels/schema', () => HttpResponse.json(dataModels)),
    http.get('*/api/v2/perspectives', () => HttpResponse.json(perspectives)),
  );
});

it('renders chatbot with the correct default dimensions', async () => {
  const { container } = setup(
    <MockApiWrapper>
      <Chatbot />
    </MockApiWrapper>,
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
    <MockApiWrapper>
      <Chatbot width="100px" height="50px" />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());

  expect(container.firstChild).toHaveStyle({
    minWidth: '500px',
    minHeight: '500px',
  });
});

it('renders chatbot with custom, valid dimensions', async () => {
  const { container } = setup(
    <MockApiWrapper>
      <Chatbot width="700px" height="800px" />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());

  expect(container.firstChild).toHaveStyle({
    minWidth: '500px',
    minHeight: '500px',
    width: '700px',
    height: '800px',
  });
});
