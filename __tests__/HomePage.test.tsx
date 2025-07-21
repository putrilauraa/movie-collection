import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('Home Page', () => {
    it('renders a heading', () => {
        render(<HomePage />);
        const heading = screen.getByRole('heading', { name: /welcome/i });
        expect(heading).toBeInTheDocument();
    });
});