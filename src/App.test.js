import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the calculator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/React Calculator/i);
  expect(titleElement).toBeInTheDocument();
});

test('performs a simple addition', async () => {
  const user = userEvent.setup();
  render(<App />);

  // The input element is a textbox
  const display = screen.getByRole('textbox');
  expect(display.value).toBe('');

  // Find buttons by their accessible name (the text they display)
  const button7 = screen.getByRole('button', { name: '7' });
  const buttonPlus = screen.getByRole('button', { name: '+' });
  const button8 = screen.getByRole('button', { name: '8' });
  const buttonEquals = screen.getByRole('button', { name: '=' });

  // Simulate user clicking 7 + 8 =
  await user.click(button7);
  await user.click(buttonPlus);
  await user.click(button8);
  expect(display.value).toBe('7+8');

  await user.click(buttonEquals);
  expect(display.value).toBe('15');
});
