import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TextAreaWithControls from '../TextAreaWithControls';
import ResponsiveDialog from '../ResponsiveDialog/ResponsiveDialog';

export type CorrectionType = 'correct' | 'improve';

export const ANONYMOUS_CHAR_LIMIT = 50;
export const AUTHORIZED_CHAR_LIMIT = 500;
export const PREMIUM_CHAR_LIMIT = 2000;
export const MAX_FREE_CORRECTIONS_PER_DAY = 5;

export interface GrammarCheckerProps {
  processText: (text: string, type: CorrectionType) => Promise<string>;
  isUserLoggedIn: boolean;
  hasPremiumAccess: boolean;
  premiumUntil: Date | null;
  correctionsUsedToday: number;
  firstCorrectionTimestamp: any | null;
  setIsLimitHit: (isHit: boolean) => void;
}

export const GrammarChecker: React.FC<GrammarCheckerProps> = ({
  processText, 
  isUserLoggedIn,
  hasPremiumAccess, 
  premiumUntil, 
  correctionsUsedToday,
  firstCorrectionTimestamp,
  setIsLimitHit
}) => {
  const { t } = useTranslation();
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const charLimit = isUserLoggedIn
    ? (hasPremiumAccess ? PREMIUM_CHAR_LIMIT : AUTHORIZED_CHAR_LIMIT)
    : ANONYMOUS_CHAR_LIMIT;

  const [text, setText] = useState('');
  const [previousState, setPreviousState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<CorrectionType | null>(null);
  const charCount = text.length;
  const [error, setError] = useState<string | null>(null);

  const isLimitReached = useCallback(() => {
    if (hasPremiumAccess) return false;
    if (!isUserLoggedIn) return charCount >= ANONYMOUS_CHAR_LIMIT;
    
    const now = new Date();
    if (!firstCorrectionTimestamp || 
        now.getTime() - firstCorrectionTimestamp.toDate().getTime() >= 24 * 60 * 60 * 1000) {
      return false;
    }
    
    return correctionsUsedToday >= MAX_FREE_CORRECTIONS_PER_DAY;
  }, [hasPremiumAccess, isUserLoggedIn, charCount, firstCorrectionTimestamp, correctionsUsedToday]);

  // Add this useEffect to notify the parent component when the limit is reached
  useEffect(() => {
    setIsLimitHit(isLimitReached());
  }, [isLimitReached, setIsLimitHit]);

  const getRemainingCorrections = useCallback(() => {
    if (!firstCorrectionTimestamp) return MAX_FREE_CORRECTIONS_PER_DAY;
    
    const now = new Date();
    if (now.getTime() - firstCorrectionTimestamp.toDate().getTime() >= 24 * 60 * 60 * 1000) {
      return MAX_FREE_CORRECTIONS_PER_DAY;
    }
    
    return Math.max(0, MAX_FREE_CORRECTIONS_PER_DAY - correctionsUsedToday);
  }, [firstCorrectionTimestamp, correctionsUsedToday]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText.slice(0, charLimit));
    setPreviousState(null);
    setError(null);
  };

  const handleCorrection = async (type: CorrectionType) => {
    if (isLimitReached()) {
      setError(t('grammarChecker.dailyLimitReached', { limit: MAX_FREE_CORRECTIONS_PER_DAY }));
      return;
    }

    setIsLoading(true);
    setActiveAction(type);
    setPreviousState(text);
    try {
      const result = await processText(text, type);
      setText(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Daily correction limit reached') {
        setError(t('grammarChecker.dailyLimitReached', { limit: MAX_FREE_CORRECTIONS_PER_DAY }));
      } else {
        console.error(`Error ${type}ing text:`, error);
        setError(t('grammarChecker.error'));
      }
    }
    setIsLoading(false);
  };

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && data[0] && data[0].length > 0) {
        const translatedText = data[0].map((item: any) => item[0]).join('');
        setTranslatedText(translatedText);
        setShowTranslation(true);
      } else {
        throw new Error('No translation found in response.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(t('grammarChecker.translationError'));
    }
    setIsLoading(false);
  };

  const handleCloseTranslation = () => {
    setShowTranslation(false);
  };

  const getLoadingText = () => {
    if (activeAction === 'correct') return t('grammarChecker.correcting');
    if (activeAction === 'improve') return t('grammarChecker.improving');
    if (activeAction === 'translate') return t('grammarChecker.translating');
    return '';
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      <h2 className="text-xl mb-4 font-heading">
        <span className="hidden md:inline">{t('Исправление ошибок текста для грамотного письма на любом языке.')}</span>
        <span className="md:hidden">{t('Исправление ошибок')}</span>
      </h2>
      <TextAreaWithControls
        value={text}
        onChange={handleTextChange}
        onTranslate={handleTranslate}
        placeholder={t('Введите ваш текст здесь...')}
        disabled={isLoading}
        isLoading={isLoading}
        loadingText={getLoadingText()}
        copyTitle={t('grammarChecker.copy')}
        revertTitle={t('grammarChecker.revert')}
        translateTitle={t('grammarChecker.translate')}
        previousValue={previousState}
        onRevert={() => {
          if (previousState !== null) {
            setText(previousState);
            setPreviousState(null);
          }
        }}
      />
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-body disabled:opacity-50"
            onClick={() => handleCorrection('correct')}
            disabled={isLoading || text.length === 0}
          >
            {t('Править')}
          </button>
          <button
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 font-body disabled:opacity-50"
            onClick={() => handleCorrection('improve')}
            disabled={isLoading || text.length === 0}
          >
            {t('Улучшить')}
          </button>
        </div>
        {charCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {charCount}/{charLimit}
          </span>
        )}
      </div>
      {isLimitReached() && !isUserLoggedIn && (
            <div className="bg-secondary/20 p-4 rounded-md text-center animate-pulse">
              <p className="text-secondary-foreground font-semibold mb-2">
                {t('grammarChecker.limitReached')}
              </p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 p-4 rounded-md text-center mb-4">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}
      {hasPremiumAccess && premiumUntil && (
        <div className="bg-green-100 p-4 rounded-md text-center mb-4">
          <p className="text-green-800 font-semibold">
            {t('grammarChecker.premiumAccess', { date: premiumUntil.toLocaleDateString() })}
          </p>
          <p className="text-green-700">
            {t('grammarChecker.premiumFeatures', { limit: PREMIUM_CHAR_LIMIT })}
          </p>
        </div>
      )}
      {isUserLoggedIn && !hasPremiumAccess && (
        <div className="bg-yellow-100 p-4 rounded-md text-center mb-4">
          <p className="text-yellow-800 font-semibold">
            {t('grammarChecker.freeAccount', { 
              limit: AUTHORIZED_CHAR_LIMIT, 
              remaining: getRemainingCorrections()
            })}
          </p>
          <p className="text-yellow-700">
            {t('grammarChecker.upgradeToPremium', { limit: PREMIUM_CHAR_LIMIT })}
          </p>
        </div>
      )}
      {showTranslation && (
      <ResponsiveDialog
        isOpen={showTranslation}
        onClose={handleCloseTranslation}
        title={t('grammarChecker.translation')}
      >
        <p className="text-muted-foreground mt-4">{translatedText}</p>
      </ResponsiveDialog>
      )}
    </div>
  );
};

export default GrammarChecker;