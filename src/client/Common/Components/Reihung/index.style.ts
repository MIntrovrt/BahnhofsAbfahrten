import { createStyles } from '@material-ui/styles';
import { ReduxProps } from '.';

export default createStyles(theme => ({
  wrap: {
    overflowX: 'auto',
  },
  main: ({ reihung, fahrzeugGruppe }: ReduxProps) => {
    let height = 6;

    if (fahrzeugGruppe) height += 1;
    if (
      reihung &&
      (reihung.differentDestination ||
        (reihung.zuggattung === 'ICE' &&
          reihung.allFahrzeuggruppe.find(g => Boolean(g.br))))
    )
      height += 1;
    if (reihung && reihung.differentZugnummer) height += 1;

    return {
      minWidth: '60em',
      overflow: 'hidden',
      position: 'relative',
      fontSize: '160%',
      marginBottom: '1em',
      marginRight: '.3em',
      height: `${height}em`,
    };
  },
  specificType: {
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
  },
  sektoren: {
    position: 'relative',
  },
  reihung: {
    position: 'relative',
    marginTop: '1.3em',
    height: '100%',
  },
  richtung: ({ reihung }) => ({
    backgroundColor: theme.palette.text.primary,
    width: '50%',
    height: 2,
    position: 'absolute',
    left: '50%',
    bottom: '.5em',
    zIndex: 10,
    transform:
      reihung && reihung.realFahrtrichtung
        ? 'translateX(-50%)'
        : 'rotate(180deg) translateX(50%)',
    '&::after': {
      border: `solid ${theme.palette.text.primary}`,
      borderWidth: '0 2px 2px 0',
      display: 'inline-block',
      padding: 3,
      content: '""',
      transform: 'rotate(135deg)',
      position: 'absolute',
      top: -3,
    },
  }),
}));
