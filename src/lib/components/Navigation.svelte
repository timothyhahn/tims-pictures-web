<script lang="ts">
	import { page } from '$app/stores';
	import { slide, fade } from 'svelte/transition';
	import { CornerDownRight } from 'lucide-svelte';
	import { sidebarContext, sidebarRevealed } from '$lib/stores/sidebarContext';

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

	// Check if we're on an albums-related page (album detail or picture)
	function isAlbumsRelated(): boolean {
		return $page.url.pathname.startsWith('/albums/') || $page.url.pathname.startsWith('/pictures/');
	}

	// Key for fading contextual content when it changes
	let contextKey = $derived(
		$sidebarContext?.type === 'picture'
			? $sidebarContext.currentIndex
			: $sidebarContext?.type === 'album'
				? $sidebarContext.albumSlug
				: null
	);
</script>

<!-- Desktop Navigation - Left Sidebar -->
<nav
	class="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col p-6 text-white md:flex"
	style="background-color: var(--color-bg);{$sidebarRevealed
		? ' view-transition-name: sidebar;'
		: ''}"
>
	<!-- Logo/Branding -->
	<div class="mb-8">
		<h1 class="text-2xl">Tim's Pictures</h1>
	</div>

	<!-- Navigation Links -->
	<ul class="space-y-2">
		{#each navItems as item (item.href)}
			<li>
				<a
					href={item.href}
					class="block rounded-lg px-4 py-2 transition-colors {isActive(item.href) ||
					(item.href === '/albums' && isAlbumsRelated() && !$sidebarContext?.albumName)
						? 'bg-white/10 text-white'
						: 'text-gray-400 hover:bg-white/5 hover:text-white'}"
				>
					{item.label}
				</a>
			</li>
		{/each}

		<!-- Breadcrumb: animated album name below Albums -->
		{#if $sidebarContext?.albumName}
			<li transition:slide={{ duration: 200 }}>
				<a
					href="/albums/{$sidebarContext.albumSlug}"
					class="flex items-center gap-2 overflow-hidden rounded-lg bg-white/10 py-1.5 pr-4 pl-8 text-sm text-white transition-colors hover:text-white"
				>
					<span class="sidebar-arrow text-gray-500"
						><CornerDownRight size={14} strokeWidth={2.5} /></span
					>
					<span class="breadcrumb-name truncate">{$sidebarContext.albumName}</span>
				</a>
			</li>
		{/if}
	</ul>

	<!-- Contextual Content (scrollable, fills middle) -->
	{#if $sidebarContext}
		<div
			class="context-container mt-4 flex-1 overflow-y-auto border-t border-white/10 pt-4"
			transition:fade={{ duration: 200 }}
		>
			{#key contextKey}
				<div class="context-fade" transition:fade={{ duration: 300 }}>
					{#if $sidebarContext.type === 'album'}
						{#if $sidebarContext.description}
							<p class="mb-3 px-1 text-sm leading-relaxed text-gray-400">
								{$sidebarContext.description}
							</p>
						{/if}
						<p class="px-1 text-xs text-gray-500">
							{$sidebarContext.pictureCount}
							{$sidebarContext.pictureCount === 1 ? 'photo' : 'photos'}
						</p>
					{:else if $sidebarContext.type === 'picture'}
						{#if $sidebarContext.albumDescription}
							<p class="mb-3 px-1 text-sm leading-relaxed text-gray-400">
								{$sidebarContext.albumDescription}
							</p>
						{/if}
						{#if $sidebarContext.albumPictureCount}
							<p class="mb-3 px-1 text-xs text-gray-500">
								{#if $sidebarContext.currentIndex !== undefined && $sidebarContext.currentIndex >= 0}
									Photo {$sidebarContext.currentIndex + 1} of {$sidebarContext.albumPictureCount}
								{:else}
									{$sidebarContext.albumPictureCount}
									{$sidebarContext.albumPictureCount === 1 ? 'photo' : 'photos'}
								{/if}
							</p>
						{/if}
						{#if $sidebarContext.description}
							<div class="mb-4">
								<h3 class="mb-1 px-1 text-xs font-semibold text-gray-500">Description</h3>
								<p class="px-1 text-sm text-gray-300">{$sidebarContext.description}</p>
							</div>
						{/if}
						{#if $sidebarContext.metadata.length > 0}
							<div>
								<h3 class="mb-2 px-1 text-xs font-semibold text-gray-500">Details</h3>
								<dl class="space-y-1.5 text-xs">
									{#each $sidebarContext.metadata as item (item.label)}
										<div class="flex justify-between px-1">
											<dt class="text-gray-500">{item.label}</dt>
											<dd class="text-right text-gray-300">{item.value}</dd>
										</div>
									{/each}
								</dl>
							</div>
						{/if}
					{/if}
				</div>
			{/key}
		</div>
	{:else}
		<div class="flex-1"></div>
	{/if}

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

<style>
	.sidebar-arrow {
		display: inline-flex;
		animation: arrow-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.sidebar-arrow :global(svg) {
		overflow: visible;
	}

	.sidebar-arrow :global(path),
	.sidebar-arrow :global(polyline) {
		stroke-dasharray: 40;
		stroke-dashoffset: 40;
		animation: stroke-draw 0.6s ease-out 0.15s forwards;
	}

	@keyframes arrow-slide-in {
		0% {
			opacity: 0;
			transform: translateX(-16px) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	@keyframes stroke-draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	.breadcrumb-name {
		animation: text-reveal 0.4s ease-out 0.35s both;
	}

	@keyframes text-reveal {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	/* Stack old/new content in same cell during crossfade */
	.context-container {
		display: grid;
	}

	.context-fade {
		grid-row: 1;
		grid-column: 1;
	}
</style>
