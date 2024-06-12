import { setup } from '@/__test-helpers__';
import { BearerAuthenticator, HttpClient } from '@sisense/sdk-rest-client';
import { screen, waitFor } from '@testing-library/react';
import { ChatApiContext } from '../api/chat-api-provider';
import { SendFeedbackRequest } from '../api/types';
import { ChatRestApi } from '../api/chat-rest-api';
import FeedbackWrapper from './feedback-wrapper';

vi.mock('@sisense/sdk-rest-client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@sisense/sdk-rest-client')>();
  return {
    ...mod,
    HttpClient: vi.fn(),
  };
});

const partialFeedbackPayload: Omit<SendFeedbackRequest, 'rating'> = {
  sourceId: 'Test Source',
  data: { key1: 'value1', key2: 'value2' },
  type: 'test/type',
};

const setupFeedbackWrapper = () => {
  const httpClient = new HttpClient(
    'http://fake-url',
    new BearerAuthenticator('http://fake-url', 'fake-token'),
    'mock-env',
  );
  const api = new ChatRestApi(httpClient);
  const mockSendFeedback = vi.fn();
  api.ai.sendFeedback = mockSendFeedback;

  const utils = setup(
    <ChatApiContext.Provider value={api}>
      <FeedbackWrapper
        {...partialFeedbackPayload}
        renderContent={(buttonRow) => (
          <div>
            <div style={{ width: 200, height: 200 }}>inner div</div>
            {buttonRow}
          </div>
        )}
      />
    </ChatApiContext.Provider>,
    true,
  );

  return {
    ...utils,
    api,
  };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('FeedbackWrapper', () => {
  it('shows buttons on hover and hides buttons when unhovered', async () => {
    const { user } = setupFeedbackWrapper();

    const innerDiv = screen.getByText('inner div');
    await user.hover(innerDiv);

    expect(screen.getByLabelText('thumbs-up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs-down')).toBeInTheDocument();

    await user.unhover(innerDiv);

    expect(screen.queryByLabelText('thumbs-up')).toBeNull();
    expect(screen.queryByLabelText('thumbs-down')).toBeNull();
  });

  describe('when clicking the thumbs up button', () => {
    it('sends feedback with a rating of 1 and hides buttons', async () => {
      const { user, api } = setupFeedbackWrapper();

      const innerDiv = screen.getByText('inner div');
      await user.hover(innerDiv);

      const thumbsUpButton = screen.getByLabelText('thumbs-up');
      expect(thumbsUpButton).toBeInTheDocument();

      await user.click(thumbsUpButton);

      await waitFor(() => expect(api.ai.sendFeedback).toHaveBeenCalledOnce());

      expect(api.ai.sendFeedback).toHaveBeenCalledWith({
        ...partialFeedbackPayload,
        rating: 1,
      });

      await user.hover(innerDiv);

      await waitFor(() => expect(screen.queryByLabelText('thumbs-up')).toBeDisabled());
      await waitFor(() => expect(screen.queryByLabelText('thumbs-down')).toBeDisabled());
    });
  });

  describe('when clicking the thumbs down button', () => {
    it('sends feedback with a rating of -1 and hides buttons', async () => {
      const { user, api } = setupFeedbackWrapper();

      const innerDiv = screen.getByText('inner div');
      expect(innerDiv).toBeInTheDocument();

      await user.hover(innerDiv);

      const thumbsUpButton = screen.getByLabelText('thumbs-down');
      expect(thumbsUpButton).toBeInTheDocument();

      await user.click(thumbsUpButton);

      await waitFor(() => expect(api.ai.sendFeedback).toHaveBeenCalledOnce());

      expect(api.ai.sendFeedback).toHaveBeenCalledWith({
        ...partialFeedbackPayload,
        rating: -1,
      });

      await user.hover(innerDiv);

      await waitFor(() => expect(screen.queryByLabelText('thumbs-up')).toBeDisabled());
      await waitFor(() => expect(screen.queryByLabelText('thumbs-down')).toBeDisabled());
    });
  });
});
