import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GrammarChecker, { CorrectionType } from './GrammarChecker';
import { ANONYMOUS_CHAR_LIMIT, PREMIUM_CHAR_LIMIT, MAX_FREE_CORRECTIONS_PER_DAY } from './GrammarChecker';

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

describe('GrammarChecker', () => {
  const mockProcessText = jest.fn().mockImplementation((text: string, type: CorrectionType) => {
    return Promise.resolve(type === 'correct' ? 'Corrected text' : 'Improved text');
  });

  const mockSetIsLimitHit = jest.fn();

  const defaultProps = {
    processText: mockProcessText,
    isUserLoggedIn: false,
    hasPremiumAccess: false,
    premiumUntil: null,
    correctionsUsedToday: 0,
    firstCorrectionTimestamp: null,
    setIsLimitHit: mockSetIsLimitHit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the grammar checker section', () => {
    render(<GrammarChecker {...defaultProps} />);

    expect(screen.getByText('Исправление ошибок текста для грамотного письма на любом языке.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите ваш текст здесь...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Править' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Улучшить' })).toBeInTheDocument();
  });

  it('updates character count as user types', () => {
    render(<GrammarChecker {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Введите ваш текст здесь...');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    
    expect(screen.getByText(`5/${ANONYMOUS_CHAR_LIMIT}`)).toBeInTheDocument();
  });

  it('prevents input beyond character limit for anonymous users', () => {
    render(<GrammarChecker {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Введите ваш текст здесь...');
    
    fireEvent.change(textarea, { target: { value: 'a'.repeat(ANONYMOUS_CHAR_LIMIT + 10) } });
    
    expect(textarea).toHaveValue('a'.repeat(ANONYMOUS_CHAR_LIMIT));
    expect(screen.getByText(`${ANONYMOUS_CHAR_LIMIT}/${ANONYMOUS_CHAR_LIMIT}`)).toBeInTheDocument();
  });

  it('shows limit reached message for anonymous users', () => {
    render(<GrammarChecker {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Введите ваш текст здесь...');
    fireEvent.change(textarea, { target: { value: 'a'.repeat(ANONYMOUS_CHAR_LIMIT + 1) } });
    expect(screen.getByText('grammarChecker.limitReached')).toBeInTheDocument();
  });

  it('shows premium access message for premium users', () => {
    const premiumProps = {
      ...defaultProps,
      isUserLoggedIn: true,  // Changed from user: { uid: '123' }
      hasPremiumAccess: true,
      premiumUntil: new Date('2023-12-31'),
    };
    render(<GrammarChecker {...premiumProps} />);
    
    expect(screen.getByText('grammarChecker.premiumAccess')).toBeInTheDocument();
    expect(screen.getByText('grammarChecker.premiumFeatures')).toBeInTheDocument();
  });

  it('shows free account message for non-premium users', () => {
    const nonPremiumProps = {
      ...defaultProps,
      isUserLoggedIn: true,  // Changed from user: { uid: '123' }
      hasPremiumAccess: false,
    };
    render(<GrammarChecker {...nonPremiumProps} />);
    
    expect(screen.getByText('grammarChecker.freeAccount')).toBeInTheDocument();
    expect(screen.getByText('grammarChecker.upgradeToPremium')).toBeInTheDocument();
  });

  it('uses correct character limit based on user status', () => {
    const premiumProps = {
      ...defaultProps,
      isUserLoggedIn: true,  // Changed from user: { uid: '123' }
      hasPremiumAccess: true,
    };
    render(<GrammarChecker {...premiumProps} />);
    const textarea = screen.getByPlaceholderText('Введите ваш текст здесь...');
    
    fireEvent.change(textarea, { target: { value: 'a'.repeat(PREMIUM_CHAR_LIMIT) } });
    
    expect(screen.getByText(`${PREMIUM_CHAR_LIMIT}/${PREMIUM_CHAR_LIMIT}`)).toBeInTheDocument();
  });

  it('calls setIsLimitHit when limit is reached', () => {
    const props = {
      ...defaultProps,
      isUserLoggedIn: true,
      correctionsUsedToday: MAX_FREE_CORRECTIONS_PER_DAY,
      firstCorrectionTimestamp: { toDate: () => new Date() },
    };
    render(<GrammarChecker {...props} />);
    expect(mockSetIsLimitHit).toHaveBeenCalledWith(true);
  });
});