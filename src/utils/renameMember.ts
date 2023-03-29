// Rename user to [Prénom NOM - Role]
export async function renameMember(member: any, userSite: any, roleName: any) {
	let firstName = userSite.first_name.toLowerCase().replace(/\w\S*/g, (w: any) => (w.replace(/^\w/, (c: any) => c.toUpperCase())));
	// Remove too long last name
	const lastName = userSite.last_name.toUpperCase().split(/[-\s]/)[0];

	// Je veux bien dev le bot de l'inté par contre on respecte mon prénom, merci
	if (firstName === 'Noe') firstName = 'Noé';

	let name = firstName + ' ' + lastName;

	// 32 characters is the maximum length of a discord name
	const maxChar = 32;
    // if the role name is displayed, we need to remove 3 characters + the length of the role name
    // const maxChar = 32 - 3 - roleName.length;

	// If too long name then remove some chars
	if (name.length > maxChar) {
		name = name.substring(0, maxChar);
	}

	// const roleSuffix = (roleName === null) ? '' : ' - ' + roleName;

	await member.setNickname(name).catch((error: any) => {
		error(error);
	});
}
