import { Abfahrt as AbfahrtType } from 'types/iris';
import BaseAbfahrt from './BaseAbfahrt';
import React, { useMemo } from 'react';
import useWings from 'Abfahrten/container/AbfahrtenContainer/useWings';

interface Props {
  abfahrt: AbfahrtType;
}

const Abfahrt = ({ abfahrt }: Props) => {
  const wings = useWings(abfahrt);

  const sameTrainWing = useMemo(
    () =>
      Boolean(
        wings?.every(
          w =>
            w.train.number.endsWith(abfahrt.train.number) &&
            w.train.type !== abfahrt.train.type
        )
      ),
    [abfahrt.train.number, abfahrt.train.type, wings]
  );

  const wingNumbers = useMemo(
    () =>
      wings?.length
        ? wings.map(w => w.train.number).concat([abfahrt.train.number])
        : undefined,
    [abfahrt.train.number, wings]
  );

  return (
    <>
      <BaseAbfahrt
        abfahrt={abfahrt}
        sameTrainWing={sameTrainWing}
        wingNumbers={wingNumbers}
        wingStart={Boolean(wingNumbers)}
      />
      {wings &&
        wings.map((w, index) => (
          <BaseAbfahrt
            sameTrainWing={sameTrainWing}
            abfahrt={w}
            key={w.rawId}
            wingNumbers={wingNumbers}
            wingEnd={wings.length === index + 1}
          />
        ))}
    </>
  );
};

export default Abfahrt;
