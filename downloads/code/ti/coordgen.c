#include "SpiceUsr.h"
#include <ctype.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv)
{
	ConstSpiceChar *planet;
	const char *tic, *tac;
	ConstSpiceChar *frame = "J2000";
	ConstSpiceChar *abcorr = "NONE";
	ConstSpiceChar *observer = "EARTH";
	SpiceDouble et;
	SpiceDouble pos[3], lt;
	SpiceDouble range, ra, dec;
	int i, c;

	if (argc != 4) {
		fprintf(stderr, "usage: %s target start-date end-date\n", argv[0]);
		return 1;
	}
	planet = argv[1];
	tic = argv[2];
	tac = argv[3];

	furnsh_c("de431.bsp");
	furnsh_c("naif0010.tls");

	str2et_c(tic, &et);
	for (;;) {
		char timestr[64], *p;

		// reset et to 00:00 of that day
		timout_c(et, "YYYY-MON-DD", sizeof(timestr), timestr);
		str2et_c(timestr, &et);

		spkpos_c(planet, et, frame, abcorr, observer, pos, &lt);
		recrad_c(pos, &range, &ra, &dec);

		ra *= dpr_c();
		dec *= dpr_c();

		printf("%s 00:00 %03.5f %9.5f\n", timestr, ra, dec);

		// strip leading space
		for (p = timestr; isspace(*p); ++p)
			;
		if (strcmp(p, tac) == 0)
			break;

		// bump one day
		for (;;) {
			char nextstr[64];

			et += spd_c();
			timout_c(et, "YYYY-MON-DD", sizeof(nextstr), nextstr);
			if (strcmp(timestr, nextstr))
				break;
		}
	}
}
