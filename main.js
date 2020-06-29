class Molecule {
	constructor(atoms = []) {
		this.atoms = atoms;
		this.joke = false;
	}

	addAtom(element = "C", bonds = [], dbonds = [], tbonds = [], main = false) {
		let a = new Atom(element, this, bonds, dbonds, tbonds, main);
		for (let i of bonds) {
			let e = this.atoms[i] ?? {};
			if (e.valence == e.bonds.length + e.dbonds.length * 2 + e.tbonds.length * 3)
				return `Insufficient valence electrons on ${e.element} ${i}`;
			else e.bonds.push(this.atoms.length);
		}
		for (let i of dbonds) {
			let e = this.atoms[i] ?? {};
			if (e.valence < e.bonds.length + e.dbonds.length * 2 + e.tbonds.length * 3 + 2)
				return `Insufficient valence electrons on ${e.element} ${i}`;
			else e.dbonds.push(this.atoms.length);
		}
		for (let i of tbonds) {
			let e = this.atoms[i] ?? {};
			if (e.valence < e.bonds.length + e.dbonds.length * 2 + e.tbonds.length * 3 + 3)
				return `Insufficient valence electrons on ${e.element} ${i}`;
			else e.tbonds.push(this.atoms.length);
		}
		this.atoms.push(a);
	}

	addYl(pos, deg) {
		let x = this.addAtom("C", [pos - 1]);
		if (x) this.addAtom("C", [this.atoms.length - pos + 1]);
		for (let i = 0; i < deg - 1; i++) {
			this.addAtom("C", [this.atoms.length - 1]);
		}
	}

	static fromName(name) {
		let m = new Molecule();
		if (/\w+une/.test(name)) {
			m.joke = true;
			return m;
		}
		let prefixes = [];
		let sidegroups = [];
		let ylgroups = [];
		let extracarbons = 0;
		if (name.endsWith("ane")) {
			name = name.replace(
				/[\d,]+-\w*(fluoro|chloro|bromo|iodo|astato|tennesso|yl)/g,
				(match, c1) => {
					if (c1 !== "yl") {
						prefixes.push(match);
						match = match.slice(0, -c1.length).replace(/-.+/, "");
						match
							.split(",")
							.map(e => parseInt(e) - 1)
							.forEach(e => {
								if (!sidegroups[e]) sidegroups[e] = [];
								sidegroups[e].push(HALOGENS[c1]);
							});
					} else {
						let a = match.split("-");
						a[0] = a[0].split(",").map(parseFloat);
						a[1] = a[1].slice(0, -2);
						let buffer = "";
						while (GREEK[buffer] == undefined && buffer.length < a[1].length) {
							buffer += a[1][buffer.length];
						}
						if (buffer.length !== a[1].length) a[1] = a[1].replace(buffer, "");
						a[1] = NUM_PREFIX[a[1]];
						for (let i of a[0]) {
							ylgroups.push([i, a[1]]);
							extracarbons += a[1];
						}
					}
					return "";
				}
			);
			name = name.replace(/-/g, "").slice(0, -3);
			let main = NUM_PREFIX[name];
			m.addAtom("C", [], [], [], true);
			for (let i = 0; i < main - 1; i++) m.addAtom("C", [m.atoms.length - 1], [], [], true);
			for (let i of ylgroups) m.addYl(i[0], i[1]);
			for (let i = 0; i < main + extracarbons; i++) {
				let a = m.atoms[i];
				let s = sidegroups[i] || [];
				while (a.bonds.length + a.dbonds.length * 2 + a.tbonds.length * 3 < a.valence) {
					if (s.length == 0) m.addAtom("H", [i]);
					else m.addAtom(s.pop(), [i]);
				}
			}
		}
		if (name.endsWith("ene")) {
			name = name.replace(
				/[\d,]+-\w*(fluoro|chloro|bromo|iodo|astato|tennesso|yl)/g,
				(match, c1) => {
					if (c1 !== "yl") {
						prefixes.push(match);
						match = match.slice(0, -c1.length).replace(/-.+/, "");
						match
							.split(",")
							.map(e => parseInt(e) - 1)
							.forEach(e => {
								if (!sidegroups[e]) sidegroups[e] = [];
								sidegroups[e].push(HALOGENS[c1]);
							});
					} else {
						let a = match.split("-");
						a[0] = a[0].split(",").map(parseFloat);
						a[1] = a[1].slice(0, -2);
						let buffer = "";
						while (GREEK[buffer] == undefined && buffer.length < a[1].length) {
							buffer += a[1][buffer.length];
						}
						if (buffer.length !== a[1].length) a[1] = a[1].replace(buffer, "");
						a[1] = NUM_PREFIX[a[1]];
						for (let i of a[0]) {
							ylgroups.push([i, a[1]]);
							extracarbons += a[1];
						}
					}
					return "";
				}
			);
			name = name.replace(/-/g, "").slice(0, -3);
			let tempthing = name.replace(/[a-zA-Z]/g, "");
			let dbondpos = tempthing
				.split(",")
				.map(parseFloat)
				.map(e => (isNaN(e) ? 1 : e));
			name = name.replace(/[\d,]/g, "");
			let buff = "";
			while (buff.length < name.length && !NUM_PREFIX[buff]) buff += name[buff.length];
			if (!NUM_PREFIX[buff]) buff = "meth";
			let main = NUM_PREFIX[buff];
			let defaultCount = GREEK[name.replace(buff, "")];
			if (tempthing.length == 0) {
				for (let i = 0; i < defaultCount; i++) dbondpos[i] = i * 2 + 1;
			}
			m.addAtom("C", [], [], [], true);
			for (let i = 0; i < main - 1; i++) {
				if (dbondpos.includes(i + 1)) {
					m.addAtom("C", [], [m.atoms.length - 1], [], true);
				} else {
					m.addAtom("C", [m.atoms.length - 1], [], [], true);
				}
			}
			for (let i of ylgroups) m.addYl(i[0], i[1]);
			for (let i = 0; i < main + extracarbons; i++) {
				let a = m.atoms[i];
				let s = sidegroups[i] || [];
				while (a.bonds.length + a.dbonds.length * 2 + a.tbonds.length * 3 < a.valence) {
					if (s.length == 0) m.addAtom("H", [i]);
					else m.addAtom(s.pop(), [i]);
				}
			}
		}
		if (name.endsWith("yne")) {
			name = name.replace(
				/[\d,]+-\w*(fluoro|chloro|bromo|iodo|astato|tennesso|yl)/g,
				(match, c1) => {
					if (c1 !== "yl") {
						prefixes.push(match);
						match = match.slice(0, -c1.length).replace(/-.+/, "");
						match
							.split(",")
							.map(e => parseInt(e) - 1)
							.forEach(e => {
								if (!sidegroups[e]) sidegroups[e] = [];
								sidegroups[e].push(HALOGENS[c1]);
							});
					} else {
						let a = match.split("-");
						a[0] = a[0].split(",").map(parseFloat);
						a[1] = a[1].slice(0, -2);
						let buffer = "";
						while (GREEK[buffer] == undefined && buffer.length < a[1].length) {
							buffer += a[1][buffer.length];
						}
						if (buffer.length !== a[1].length) a[1] = a[1].replace(buffer, "");
						a[1] = NUM_PREFIX[a[1]];
						for (let i of a[0]) {
							ylgroups.push([i, a[1]]);
							extracarbons += a[1];
						}
					}
					return "";
				}
			);
			name = name.replace(/-/g, "").slice(0, -3);
			let efedupnametype = /\d+\w+\d+en/;
			let tempthing;
			if (efedupnametype.test(name)) {
				tempthing = [...name.matchAll(/\d/g)].reverse().map(e => e[0]);
			} else {
				tempthing = name.split("en");
				if (isNaN(parseFloat(name[0]))) {
					tempthing = tempthing.slice(1).map(e =>
						e
							.replace(/[a-zA-Z]/g, "")
							.split(",")
							.map(parseFloat)
							.map(e => (isNaN(e) ? 1 : e))
					);
				} else {
					tempthing = tempthing
						.map(e => e.replace(/[a-zA-Z]/g, ""))
						.filter(e => e.length > 0)
						.map(e =>
							e
								.split(",")
								.map(parseFloat)
								.map(e => (isNaN(e) ? 1 : e))
						);
				}
			}

			let dbondpos = tempthing[tempthing.length - 2] || [];
			let tbondpos = tempthing[tempthing.length - 1] || [];
			if (dbondpos[0] == 1 && tbondpos[0] == 1 && dbondpos.length == 1 && tbondpos.length == 1)
				dbondpos[0] += 2;
			name = name.replace(/[\d,]/g, "");
			let buff = "";
			while (buff.length < name.length && !NUM_PREFIX[buff]) buff += name[buff.length];
			if (!NUM_PREFIX[buff]) buff = "meth";
			let main = NUM_PREFIX[buff];
			let gprefs = name
				.replace(buff, "")
				.split("en")
				.map(e => GREEK[e]);
			// console.log(gprefs, dbondpos, tbondpos);
			if (tbondpos.length == 0) {
				for (let i = 0; i < gprefs[gprefs.length - 1] || 0; i++) dbondpos[i] = i * 2 + 1;
			}
			if (dbondpos.length == 0) {
				for (let i = 0; i < gprefs[gprefs.length - 2] || 0; i++) dbondpos[i] = i * 2 + 1;
			}
			m.addAtom("C", [], [], [], true);
			for (let i = 0; i < main - 1; i++) {
				if (tbondpos.includes(i + 1)) {
					m.addAtom("C", [], [], [m.atoms.length - 1], true);
				} else if (dbondpos.includes(i + 1)) {
					m.addAtom("C", [], [m.atoms.length - 1], [], true);
				} else {
					m.addAtom("C", [m.atoms.length - 1], [], [], true);
				}
			}
			for (let i of ylgroups) m.addYl(i[0], i[1]);
			for (let i = 0; i < main + extracarbons; i++) {
				let a = m.atoms[i];
				let s = sidegroups[i] || [];
				while (a.bonds.length + a.dbonds.length * 2 + a.tbonds.length * 3 < a.valence) {
					if (s.length == 0) m.addAtom("H", [i]);
					else m.addAtom(s.pop(), [i]);
				}
			}
		}

		return m;
	}

	get formula() {
		if (this.joke) return "C2";
		let totals = {};
		for (let i of this.atoms) {
			if (totals[i.element] == undefined) totals[i.element] = 1;
			else totals[i.element]++;
		}
		let formula = "";
		for (let i in totals) {
			formula += i + (totals[i] > 1 ? totals[i] : "");
		}
		return formula;
	}

	get condensed_formula() {
		if (this.joke) return "C≣C";
		let groups = [];
		let done = new Array(this.atoms.length).fill(false);
		let temp = [...this.atoms];
		let dbonds = new Set();
		let tbonds = new Set();
		temp.sort((a, b) => {
			a.element == "C" ? 1 : a.element < b.element ? -1 : 1;
		});
		for (let i of temp) {
			if (done[i.id]) continue;
			done[i.id] = true;
			let totals = {};
			function formulaYl(c, totals = {}) {
				done[c.id] = true;
				totals.C = totals.C + 1 || 1;
				let branches = [];
				for (let i of c.bonds) {
					if (!c.parent.atoms[i].main && !done[i]) {
						if (c.parent.atoms[i].element == "C") branches.push(formulaYl(c.parent.atoms[i]));
						else {
							totals[c.parent.atoms[i].element] = totals[c.parent.atoms[i].element] + 1 || 1;
							done[i] = true;
						}
					}
				}
				let t = "";
				for (let j in totals) {
					t += j + (totals[j] > 1 ? totals[j] : "");
				}
				for (let i of branches) {
					if (branches.length > 1 && branches.length > 1) t += `-(${i})`;
					else t += `-${i}`;
				}
				return t;
			}
			let formula = "";
			let g = "";
			for (let j of i.bonds) {
				if (this.atoms[j].main) continue;
				if (this.atoms[j].element == "C") {
					g += `(${formulaYl(this.atoms[j])})`;
					continue;
				}
				if (totals[this.atoms[j].element] == undefined) totals[this.atoms[j].element] = 1;
				else totals[this.atoms[j].element]++;
				done[j] = true;
			}
			for (let j of i.dbonds) dbonds.add(Math.min(i.id, j));
			for (let j of i.tbonds) tbonds.add(Math.min(i.id, j));
			for (let j in totals) {
				formula += j + (totals[j] > 1 ? totals[j] : "");
			}
			formula += g;
			let group = i.element;
			group += repeats(formula);
			groups.push(group);
		}
		let initstring = "";
		for (let i in groups) {
			initstring += groups[i];
			if (dbonds.has(parseFloat(i))) initstring += "=";
			else if (tbonds.has(parseFloat(i))) initstring += "≡";
			else initstring += "-";
		}
		initstring = initstring.slice(0, -1);
		return repeats(initstring, true)
			.replace(/\(-/g, "-(")
			.replace(/\(=/g, "=(")
			.replace(/\(≡/g, "≡(");
	}
}

class Atom {
	constructor(element, parent, bonds = [], dbonds = [], tbonds = [], main = false) {
		this.element = element;
		this.parent = parent;
		this.bonds = bonds;
		this.dbonds = dbonds;
		this.tbonds = tbonds;
		this.main = main;
	}

	get id() {
		return this.parent.atoms.indexOf(this);
	}

	get valence() {
		return SHELLDATA[this.element][SHELLDATA[this.element].length - 1];
	}
}

function repeats(string, i = 0) {
	if (!string.match(/-(.+)\1+/g) || i > 10) return string;
	let t = string.match(/-(.+)\1+/g)[0];
	let buffer = "";
	while (buffer.length <= t.length) {
		buffer += t[0];
		t = t.substring(1);
		if (isNaN(parseInt(buffer)) && t.startsWith(buffer)) {
			return repeats(
				string.replace(new RegExp(`(${buffer}){2,}`, "g"), match => {
					return (buffer.length > 1 ? `(${buffer})` : buffer) + match.length / buffer.length;
				}),
				i + 1
			);
		}
	}
	return string;
}

const NUM_PREFIX = {
	meth: 1,
	eth: 2,
	prop: 3,
	but: 4,
	pent: 5,
	hex: 6,
	hept: 7,
	oct: 8,
	non: 9,
	dec: 10,
	undec: 11,
	dodec: 12,
	tridec: 13,
	tetradec: 14,
	pentadec: 15,
	hexadec: 16,
	heptadec: 17,
	octadec: 18,
	nonadec: 19,
	icos: 20,
};

const GREEK = {
	"": 1,
	di: 2,
	tri: 3,
	tetra: 4,
	penta: 5,
	hexa: 6,
	hepta: 7,
	octa: 8,
	nona: 9,
	deca: 10,
	undeca: 11,
	dodeca: 12,
	trideca: 13,
	tetradeca: 14,
	pentadeca: 15,
	hexadeca: 16,
	heptadec: 17,
	octadeca: 18,
	nonadeca: 19,
	icosa: 20,
};

const HALOGENS = {
	fluoro: "F",
	chloro: "Cl",
	bromo: "Br",
	iodo: "I",
	astato: "As",
	tennesso: "Ts",
};

const DATA = [
	{ symbol: "H", shells: [1] },
	{ symbol: "He", shells: [2] },
	{ symbol: "Li", shells: [2, 1] },
	{ symbol: "Be", shells: [2, 2] },
	{ symbol: "B", shells: [2, 3] },
	{ symbol: "C", shells: [2, 4] },
	{ symbol: "N", shells: [2, 5] },
	{ symbol: "O", shells: [2, 6] },
	{ symbol: "F", shells: [2, 7] },
	{ symbol: "Ne", shells: [2, 8] },
	{ symbol: "Na", shells: [2, 8, 1] },
	{ symbol: "Mg", shells: [2, 8, 2] },
	{ symbol: "Al", shells: [2, 8, 3] },
	{ symbol: "Si", shells: [2, 8, 4] },
	{ symbol: "P", shells: [2, 8, 5] },
	{ symbol: "S", shells: [2, 8, 6] },
	{ symbol: "Cl", shells: [2, 8, 7] },
	{ symbol: "Ar", shells: [2, 8, 8] },
	{ symbol: "K", shells: [2, 8, 8, 1] },
	{ symbol: "Ca", shells: [2, 8, 8, 2] },
	{ symbol: "Sc", shells: [2, 8, 9, 2] },
	{ symbol: "Ti", shells: [2, 8, 10, 2] },
	{ symbol: "V", shells: [2, 8, 11, 2] },
	{ symbol: "Cr", shells: [2, 8, 13, 1] },
	{ symbol: "Mn", shells: [2, 8, 13, 2] },
	{ symbol: "Fe", shells: [2, 8, 14, 2] },
	{ symbol: "Co", shells: [2, 8, 15, 2] },
	{ symbol: "Ni", shells: [2, 8, 16, 2] },
	{ symbol: "Cu", shells: [2, 8, 18, 1] },
	{ symbol: "Zn", shells: [2, 8, 18, 2] },
	{ symbol: "Ga", shells: [2, 8, 18, 3] },
	{ symbol: "Ge", shells: [2, 8, 18, 4] },
	{ symbol: "As", shells: [2, 8, 18, 5] },
	{ symbol: "Se", shells: [2, 8, 18, 6] },
	{ symbol: "Br", shells: [2, 8, 18, 7] },
	{ symbol: "Kr", shells: [2, 8, 18, 8] },
	{ symbol: "Rb", shells: [2, 8, 18, 8, 1] },
	{ symbol: "Sr", shells: [2, 8, 18, 8, 2] },
	{ symbol: "Y", shells: [2, 8, 18, 9, 2] },
	{ symbol: "Zr", shells: [2, 8, 18, 10, 2] },
	{ symbol: "Nb", shells: [2, 8, 18, 12, 1] },
	{ symbol: "Mo", shells: [2, 8, 18, 13, 1] },
	{ symbol: "Tc", shells: [2, 8, 18, 13, 2] },
	{ symbol: "Ru", shells: [2, 8, 18, 15, 1] },
	{ symbol: "Rh", shells: [2, 8, 18, 16, 1] },
	{ symbol: "Pd", shells: [2, 8, 18, 18] },
	{ symbol: "Ag", shells: [2, 8, 18, 18, 1] },
	{ symbol: "Cd", shells: [2, 8, 18, 18, 2] },
	{ symbol: "In", shells: [2, 8, 18, 18, 3] },
	{ symbol: "Sn", shells: [2, 8, 18, 18, 4] },
	{ symbol: "Sb", shells: [2, 8, 18, 18, 5] },
	{ symbol: "Te", shells: [2, 8, 18, 18, 6] },
	{ symbol: "I", shells: [2, 8, 18, 18, 7] },
	{ symbol: "Xe", shells: [2, 8, 18, 18, 8] },
	{ symbol: "Cs", shells: [2, 8, 18, 18, 8, 1] },
	{ symbol: "Ba", shells: [2, 8, 18, 18, 8, 2] },
	{ symbol: "La", shells: [2, 8, 18, 18, 9, 2] },
	{ symbol: "Ce", shells: [2, 8, 18, 19, 9, 2] },
	{ symbol: "Pr", shells: [2, 8, 18, 21, 8, 2] },
	{ symbol: "Nd", shells: [2, 8, 18, 22, 8, 2] },
	{ symbol: "Pm", shells: [2, 8, 18, 23, 8, 2] },
	{ symbol: "Sm", shells: [2, 8, 18, 24, 8, 2] },
	{ symbol: "Eu", shells: [2, 8, 18, 25, 8, 2] },
	{ symbol: "Gd", shells: [2, 8, 18, 25, 9, 2] },
	{ symbol: "Tb", shells: [2, 8, 18, 27, 8, 2] },
	{ symbol: "Dy", shells: [2, 8, 18, 28, 8, 2] },
	{ symbol: "Ho", shells: [2, 8, 18, 29, 8, 2] },
	{ symbol: "Er", shells: [2, 8, 18, 30, 8, 2] },
	{ symbol: "Tm", shells: [2, 8, 18, 31, 8, 2] },
	{ symbol: "Yb", shells: [2, 8, 18, 32, 8, 2] },
	{ symbol: "Lu", shells: [2, 8, 18, 32, 9, 2] },
	{ symbol: "Hf", shells: [2, 8, 18, 32, 10, 2] },
	{ symbol: "Ta", shells: [2, 8, 18, 32, 11, 2] },
	{ symbol: "W", shells: [2, 8, 18, 32, 12, 2] },
	{ symbol: "Re", shells: [2, 8, 18, 32, 13, 2] },
	{ symbol: "Os", shells: [2, 8, 18, 32, 14, 2] },
	{ symbol: "Ir", shells: [2, 8, 18, 32, 15, 2] },
	{ symbol: "Pt", shells: [2, 8, 18, 32, 17, 1] },
	{ symbol: "Au", shells: [2, 8, 18, 32, 18, 1] },
	{ symbol: "Hg", shells: [2, 8, 18, 32, 18, 2] },
	{ symbol: "Tl", shells: [2, 8, 18, 32, 18, 3] },
	{ symbol: "Pb", shells: [2, 8, 18, 32, 18, 4] },
	{ symbol: "Bi", shells: [2, 8, 18, 32, 18, 5] },
	{ symbol: "Po", shells: [2, 8, 18, 32, 18, 6] },
	{ symbol: "At", shells: [2, 8, 18, 32, 18, 7] },
	{ symbol: "Rn", shells: [2, 8, 18, 32, 18, 8] },
	{ symbol: "Fr", shells: [2, 8, 18, 32, 18, 8, 1] },
	{ symbol: "Ra", shells: [2, 8, 18, 32, 18, 8, 2] },
	{ symbol: "Ac", shells: [2, 8, 18, 32, 18, 9, 2] },
	{ symbol: "Th", shells: [2, 8, 18, 32, 18, 10, 2] },
	{ symbol: "Pa", shells: [2, 8, 18, 32, 20, 9, 2] },
	{ symbol: "U", shells: [2, 8, 18, 32, 21, 9, 2] },
	{ symbol: "Np", shells: [2, 8, 18, 32, 22, 9, 2] },
	{ symbol: "Pu", shells: [2, 8, 18, 32, 24, 8, 2] },
	{ symbol: "Am", shells: [2, 8, 18, 32, 25, 8, 2] },
	{ symbol: "Cm", shells: [2, 8, 18, 32, 25, 9, 2] },
	{ symbol: "Bk", shells: [2, 8, 18, 32, 27, 8, 2] },
	{ symbol: "Cf", shells: [2, 8, 18, 32, 28, 8, 2] },
	{ symbol: "Es", shells: [2, 8, 18, 32, 29, 8, 2] },
	{ symbol: "Fm", shells: [2, 8, 18, 32, 30, 8, 2] },
	{ symbol: "Md", shells: [2, 8, 18, 32, 31, 8, 2] },
	{ symbol: "No", shells: [2, 8, 18, 32, 32, 8, 2] },
	{ symbol: "Lr", shells: [2, 8, 18, 32, 32, 8, 3] },
	{ symbol: "Rf", shells: [2, 8, 18, 32, 32, 10, 2] },
	{ symbol: "Db", shells: [2, 8, 18, 32, 32, 11, 2] },
	{ symbol: "Sg", shells: [2, 8, 18, 32, 32, 12, 2] },
	{ symbol: "Bh", shells: [2, 8, 18, 32, 32, 13, 2] },
	{ symbol: "Hs", shells: [2, 8, 18, 32, 32, 14, 2] },
	{ symbol: "Mt", shells: [2, 8, 18, 32, 32, 15, 2] },
	{ symbol: "Ds", shells: [2, 8, 18, 32, 32, 16, 2] },
	{ symbol: "Rg", shells: [2, 8, 18, 32, 32, 17, 2] },
	{ symbol: "Cn", shells: [2, 8, 18, 32, 32, 18, 2] },
	{ symbol: "Nh", shells: [2, 8, 18, 32, 32, 18, 3] },
	{ symbol: "Fl", shells: [2, 8, 18, 32, 32, 18, 4] },
	{ symbol: "Mc", shells: [2, 8, 18, 32, 32, 18, 5] },
	{ symbol: "Lv", shells: [2, 8, 18, 32, 32, 18, 6] },
	{ symbol: "Ts", shells: [2, 8, 18, 32, 32, 18, 7] },
	{ symbol: "Og", shells: [2, 8, 18, 32, 32, 18, 8] },
	{ symbol: "Uue", shells: [2, 8, 18, 32, 32, 18, 8, 1] },
];

let SHELLDATA = {};
for (let i of DATA) {
	SHELLDATA[i.symbol] = i.shells;
}
