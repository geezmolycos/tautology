
import UZIP from 'uzip';

const of0 = UZIP.F.U.of0;
const exb = UZIP.F.U.exb;

export const literalLengthSymbols = 
  [...Array(256).keys()]
  .map(x => '0x' + x.toString(16).toUpperCase().padStart(2, '0'))
  .concat(['end'])
  .concat([...Array(32).keys()].map(x => 'copy'+of0[x].toString()+'('+exb[x].toString()+')'))

