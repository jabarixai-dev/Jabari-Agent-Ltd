import "./globals.css";
import "./command-center.css";
import "./public-site-content.css";

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="en">
<body>{children}</body>
</html>
);
}
