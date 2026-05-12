export class Flight {
  constructor({
    type          = 'outbound',
    flightNumber  = '',
    from          = '',
    to            = '',
    departureDate = '',
    departureTime = '',
    arrivalTime   = '',
  } = {}) {
    this.id            = crypto.randomUUID();
    this.type          = type;
    this.flightNumber  = flightNumber;
    this.from          = from;
    this.to            = to;
    this.departureDate = departureDate;
    this.departureTime = departureTime;
    this.arrivalTime   = arrivalTime;
  }
}