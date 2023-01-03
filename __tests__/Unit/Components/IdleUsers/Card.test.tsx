import { render, screen } from '@testing-library/react';
import Card from '@/components/idleUsers/card';
import { calculateIdleSince } from '@/components/idleUsers/card';

const user = {
    id: "H3vNvHtFfp1Y57tPNoQ1",
    currentStatus: {
        state: "IDLE",
        updatedAt: "1672251933839",
        from: "1672272000000",
        until: "",
        message: "js, CSS"
    },
    full_name: "Akash Shukla",
    picture: {
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667855535/profile/rZVnZKmtON5djMGuGxHl/bwhnucy8iuzrzuqbo8fg.jpg"
    },
    username: "theakashshukla"
}

describe("Idle User Card", () => {
    it("should render card", () => {
        render(<Card user={user} />)
        const userImage = screen.getByTestId('user-image');
        const fullName = screen.getByText(user.full_name);
        const idleSinceText = calculateIdleSince(user.currentStatus.from);
        const idleSince = screen.getByTestId('idle-since');
        expect(idleSince).toHaveTextContent(idleSinceText);
        expect(fullName).toBeInTheDocument();
        expect(userImage).toBeInTheDocument();
    });
})