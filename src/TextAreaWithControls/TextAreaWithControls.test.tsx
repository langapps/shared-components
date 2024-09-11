import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TextAreaWithControls } from './TextAreaWithControls';

describe('TextAreaWithControls', () => {
  const mockOnChange = jest.fn();
  const mockOnTranslate = jest.fn();
  const mockOnRevert = jest.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onTranslate: mockOnTranslate,
    onRevert: mockOnRevert,
    placeholder: 'Enter text here',
    disabled: false,
    isLoading: false,
    loadingText: 'Processing...',
    copyTitle: 'Copy',
    revertTitle: 'Revert',
    translateTitle: 'Translate',
    previousValue: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea with correct placeholder', () => {
    render(<TextAreaWithControls {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    render(<TextAreaWithControls {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows loading overlay when isLoading is true', () => {
    render(<TextAreaWithControls {...defaultProps} isLoading={true} loadingText="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('enables copy button when value is not empty', () => {
    render(<TextAreaWithControls {...defaultProps} value="not empty" />);
    expect(screen.getByTitle('Copy')).not.toBeDisabled();
  });

  it('disables copy button when value is empty', () => {
    render(<TextAreaWithControls {...defaultProps} value="" />);
    expect(screen.getByTitle('Copy')).toBeDisabled();
  });

  it('enables revert button when previousValue is defined', () => {
    render(<TextAreaWithControls {...defaultProps} previousValue="Previous text" />);
    expect(screen.getByTitle('Revert')).not.toBeDisabled();
  });

  it('disables revert button when previousValue is not defined', () => {
    render(<TextAreaWithControls {...defaultProps} value="Some text" previousValue={null} />);
    expect(screen.getByTitle('Revert')).toBeDisabled();
  });

  it('disables revert button when previousValue equals current value', () => {
    const value = "Some text";
    render(<TextAreaWithControls {...defaultProps} value={value} previousValue={value} />);
    expect(screen.getByTitle('Revert')).toBeDisabled();
  });

  it('calls onRevert when revert button is clicked', () => {
    render(<TextAreaWithControls {...defaultProps} previousValue="Previous text" />);
    fireEvent.click(screen.getByTitle('Revert'));
    expect(mockOnRevert).toHaveBeenCalled();
  });

  it('calls onTranslate when translate button is clicked', () => {
    render(<TextAreaWithControls {...defaultProps} value="Some text" />);
    fireEvent.click(screen.getByTitle('Translate'));
    expect(mockOnTranslate).toHaveBeenCalled();
  });

  it('disables copy, revert and translate buttons when textarea is disabled', () => {
    render(<TextAreaWithControls {...defaultProps} disabled={true} previousValue="Previous text" />);
    expect(screen.getByTitle('Copy')).toBeDisabled();
    expect(screen.getByTitle('Revert')).toBeDisabled();
    expect(screen.getByTitle('Translate')).toBeDisabled();
  });

  it('disables translate button when textarea is empty', () => {
    render(<TextAreaWithControls {...defaultProps} value="" />);
    expect(screen.getByTitle('Translate')).toBeDisabled();
  });

  it('enables translate button when textarea is not empty', () => {
    render(<TextAreaWithControls {...defaultProps} value="Some text" />);
    expect(screen.getByTitle('Translate')).not.toBeDisabled();
  });

  describe('Copy functionality', () => {
    let mockClipboard: { writeText: jest.Mock };

    beforeEach(() => {
      jest.useFakeTimers();
      mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      Object.assign(navigator, { clipboard: mockClipboard });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('copies text to clipboard when copy button is clicked', async () => {
      render(<TextAreaWithControls {...defaultProps} previousValue="Previous text" value="Test text" />);
      const copyButton = screen.getByTitle('Copy');

      await act(async () => {
        fireEvent.click(copyButton);
        await Promise.resolve();
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text');
    });

    it('shows success icon immediately after copying', async () => {
      render(<TextAreaWithControls {...defaultProps} previousValue="Previous text" value="Test text" />);
      const copyButton = screen.getByTitle('Copy');

      expect(copyButton.querySelector('svg')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(copyButton.querySelector('svg')).toHaveClass('text-green-500');
    });

    it('reverts to original icon after 0.5 seconds', async () => {
      render(<TextAreaWithControls {...defaultProps} previousValue="Previous text" value="Test text" />);
      const copyButton = screen.getByTitle('Copy');

      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(copyButton.querySelector('svg')).toHaveClass('text-green-500');

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      expect(copyButton.querySelector('svg')).not.toHaveClass('text-green-500');
    });
  });

  describe('Translate button', () => {
    it('shows icon only on small screens', () => {
      render(<TextAreaWithControls {...defaultProps} value="Some text" />);
      const translateButton = screen.getByTitle('Translate');
      
      expect(translateButton.querySelector('span.md\\:hidden')).toBeInTheDocument();
      expect(translateButton.querySelector('span.md\\:hidden svg')).toBeInTheDocument();
    });

    it('shows icon and text on medium and larger screens', () => {
      render(<TextAreaWithControls {...defaultProps} value="Some text" />);
      const translateButton = screen.getByTitle('Translate');
      
      expect(translateButton.querySelector('span.hidden.md\\:flex')).toBeInTheDocument();
      expect(translateButton.querySelector('span.hidden.md\\:flex')).toHaveTextContent('Translate');
      expect(translateButton.querySelector('span.hidden.md\\:flex svg')).toBeInTheDocument();
    });

    it('uses custom translate title when provided', () => {
      const customTitle = 'Custom Translate';
      render(<TextAreaWithControls {...defaultProps} value="Some text" translateTitle={customTitle} />);
      
      expect(screen.getByTitle(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });
  });
});
