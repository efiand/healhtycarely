const projectName = 'HealhtyCarely';

export default ({ page, root }) => ({
	lang: 'en',
	logo: {
		current: page === 'index',
		height: 25,
		image: `${root}images/logo.svg`,
		title: `Логотип ${projectName}`,
		url: `${root}index.html`,
		width: 174
	},
	mainNav: [
		{
			title: 'Home',
			url: '#!'
		},
		{
			title: 'Doctor',
			url: '#!'
		},
		{
			title: 'Services',
			url: '#!'
		},
		{
			title: 'Review',
			url: '#!'
		}
	],
	projectDescription: 'This free App provides a solution to your health needs by offering you a one-stop access to complete information about various medical checkups. This App carries simple tips and advice to help&nbsp;you maintain a healthy lifestyle.',
	projectName,
	sitemap: {
		groups: [
			{
				list: [
					{
						title: 'Checking Health',
						url: '#!'
					},
					{
						title: 'Find Docter',
						url: '#!'
					},
					{
						title: 'Make a Schedule',
						url: '#!'
					}
				],
				title: 'Overview'
			},
			{
				list: [
					{
						title: 'Home',
						url: '#!'
					},
					{
						title: 'About',
						url: '#!'
					},
					{
						title: 'Services',
						url: '#!'
					}
				],
				title: 'Company'
			},
			{
				list: [
					{
						title: 'Terms &amp; Conds',
						url: '#!'
					},
					{
						title: 'Privacy Police',
						url: '#!'
					},
					{
						title: 'Cookies',
						url: '#!'
					}
				],
				title: 'Explore'
			},
			{
				iconable: true,
				list: [
					{
						icon: 'facebook',
						title: 'Facebook',
						url: '#!'
					},
					{
						icon: 'instagram',
						title: 'Instagram',
						url: '#!'
					},
					{
						icon: 'twitter',
						title: 'Twitter',
						url: '#!'
					}
				],
				title: 'Social Media'
			}
		],
		heading: 'Sitemap'
	},
	userNav: [
		{
			title: 'Sign In',
			url: '#!'
		},
		{
			primary: true,
			title: 'Sign Up',
			url: '#!'
		}
	]
});
