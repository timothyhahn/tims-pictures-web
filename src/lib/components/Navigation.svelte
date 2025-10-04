<script lang="ts">
	import { page } from '$app/stores';

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// Navigation items
	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/albums', label: 'Albums' }
	];

	// External links
	const externalLinks = [
		{ href: 'http://vimeo.com/timothyhahn', label: 'Videos' },
		{ href: 'https://allie.today/', label: 'Allie, Today' }
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}
</script>

<!-- Desktop Navigation - Left Sidebar -->
<nav
	class="fixed top-0 left-0 hidden h-screen w-64 flex-col p-6 text-white md:flex"
	style="background-color: var(--color-bg);"
>
	<!-- Logo/Branding -->
	<div class="mb-8">
		<h1 class="text-2xl">Tim's Pictures</h1>
	</div>

	<!-- Navigation Links -->
	<ul class="flex-1 space-y-2">
		{#each navItems as item (item.href)}
			<li>
				<a
					href={item.href}
					class="block rounded-lg px-4 py-2 transition-colors {isActive(item.href)
						? 'bg-white/10 text-white'
						: 'text-gray-400 hover:bg-white/5 hover:text-white'}"
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>

	<!-- External Links -->
	<div class="mt-auto space-y-2 border-t border-white/10 pt-6">
		{#each externalLinks as link (link.href)}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class="block rounded-lg px-4 py-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
			>
				{link.label} →
			</a>
		{/each}
	</div>
</nav>

<!-- Mobile Navigation - Top Bar -->
<nav
	class="fixed top-0 right-0 left-0 z-50 text-white md:hidden"
	style="background-color: var(--color-bg);"
>
	<div class="flex items-center justify-between p-4">
		<!-- Logo -->
		<a href="/" class="text-xl font-bold">Tim's Pictures</a>

		<!-- Hamburger Button -->
		<button
			onclick={toggleMobileMenu}
			class="rounded-lg p-2 transition-colors hover:bg-white/5"
			aria-label="Toggle menu"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if mobileMenuOpen}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile Menu Dropdown -->
	{#if mobileMenuOpen}
		<div class="border-t border-white/10" style="background-color: var(--color-bg);">
			<ul class="py-2">
				{#each navItems as item (item.href)}
					<li>
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="block px-6 py-3 {isActive(item.href)
								? 'bg-white/10 text-white'
								: 'text-gray-400 hover:bg-white/5 hover:text-white'}"
						>
							{item.label}
						</a>
					</li>
				{/each}
				{#each externalLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="block px-6 py-3 text-gray-400 hover:bg-white/5 hover:text-white"
						>
							{link.label} →
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>
