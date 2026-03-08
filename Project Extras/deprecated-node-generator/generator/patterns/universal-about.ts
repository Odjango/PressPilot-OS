import { PageContent } from '../types';

export const getUniversalAboutContent = (content?: PageContent) => {
    const title = content?.hero_title || 'About Us';
    const sub = content?.hero_sub || 'We are a dedicated team of professionals.';
    const heroImage = content?.hero_image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80';
    
    // Get business name for fallbacks
    const businessName = (content as any)?.business_name || (content as any)?.name || 'Our Restaurant';
    
    // Read about paragraphs from content (flattened format)
    const aboutParagraph1 = (content as any)?.about_paragraph_1 || 
        `${businessName} started with a simple mission: deliver quality outcomes with warmth and consistency.`;
    const aboutParagraph2 = (content as any)?.about_paragraph_2 || 
        'Our team combines domain expertise with practical service design so customers always know what to expect.';
    const aboutParagraph3 = (content as any)?.about_paragraph_3 || 
        'From first contact through long-term support, we focus on transparency, measurable value, and trusted relationships.';

    // Build team/chef section from flattened fields
    let teamHtml = '';
    const teamMembers: Array<{name: string; role: string; bio: string; photo: string}> = [];
    
    // Check for chef_name_X or team_X_name format (up to 3 members)
    for (let i = 1; i <= 3; i++) {
        const chefName = (content as any)?.[`chef_name_${i}`];
        const chefRole = (content as any)?.[`chef_role_${i}`];
        const chefBio = (content as any)?.[`chef_bio_${i}`];
        const teamName = (content as any)?.[`team_${i}_name`];
        const teamRole = (content as any)?.[`team_${i}_role`];
        const teamBio = (content as any)?.[`team_${i}_bio`];
        const teamPhoto = (content as any)?.[`team_${i}_photo`];
        
        const name = chefName || teamName;
        const role = chefRole || teamRole;
        const bio = chefBio || teamBio;
        const photo = teamPhoto || `https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80&sig=${i}`;
        
        if (name) {
            teamMembers.push({ name, role: role || 'Team Member', bio: bio || '', photo });
        }
    }
    
    // Also check for team array format (backward compatibility)
    if (teamMembers.length === 0 && content?.team && content.team.length > 0) {
        content.team.forEach((member, idx) => {
            teamMembers.push({
                name: member.name,
                role: member.role,
                bio: '',
                photo: `https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80&sig=${idx}`
            });
        });
    }
    
    if (teamMembers.length > 0) {
        const teamMembersHtml = teamMembers.map(member => `
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
        <div class="wp-block-group has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"large","linkDestination":"none","className":"is-style-rounded"} -->
            <figure class="wp-block-image size-large is-style-rounded"><img src="${member.photo}" alt="${member.name}" style="aspect-ratio:1;object-fit:cover"/></figure>
            <!-- /wp:image -->
            <!-- wp:heading {"textAlign":"center","level":3} -->
            <h3 class="wp-block-heading has-text-align-center">${member.name}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <p class="has-text-align-center has-small-font-size" style="letter-spacing:1px;text-transform:uppercase">${member.role}</p>
            <!-- /wp:paragraph -->
            ${member.bio ? `<!-- wp:paragraph {"align":"center","fontSize":"small"} -->
            <p class="has-text-align-center has-small-font-size">${member.bio}</p>
            <!-- /wp:paragraph -->` : ''}
        </div>
        <!-- /wp:group -->
        `).join('');

        teamHtml = `
        <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
        <div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
            <!-- wp:heading {"textAlign":"center","align":"wide","textColor":"contrast"} -->
            <h2 class="wp-block-heading alignwide has-text-align-center has-contrast-color has-text-color">Meet the Team</h2>
            <!-- /wp:heading -->
            <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":${Math.min(teamMembers.length, 3)},"minimumColumnWidth":null},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)">
                ${teamMembersHtml}
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
        `;
    }

    return `
    <!-- wp:cover {"url":"${heroImage}","dimRatio":70,"overlayColor":"accent-3","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
        <img class="wp-block-cover__image-background" alt="" src="${heroImage}" data-object-fit="cover"/>
        <div class="wp-block-cover__inner-container">
            <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","fontSize":"x-large"} -->
            <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color has-x-large-font-size">${title}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","textColor":"base","fontSize":"large"} -->
            <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
            <!-- /wp:paragraph -->
        </div>
    </div>
    <!-- /wp:cover -->
    <!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull">
        <!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
            <!-- wp:heading -->
            <h2 class="wp-block-heading">Our Story</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph -->
            <p>${aboutParagraph1}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>${aboutParagraph2}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>${aboutParagraph3}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        
        ${teamHtml}
    </div>
    <!-- /wp:group -->
    `;
}