import * as React from 'react';

interface EmailTemplateProps {
    name: string;
    link: string;
}

export const RegisterTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    name,
    link
}) => (
    <html>
        <h1>Welcome, {name}! Verify your account <a href={link}>here</a></h1>
    </html>
);
