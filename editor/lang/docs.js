export const funkyDocs = {
  variables: {
    // Number-type input variables
    Pitch: {
      type: "number",
      description: "Pitch input value",
      range: "-1..1 (keyboard) / -1..1 continuous (joystick)",
    },
    Roll: {
      type: "number",
      description: "Roll input value",
      range: "-1..1 (keyboard) / -1..1 continuous (joystick)",
    },
    Yaw: {
      type: "number",
      description: "Yaw input value",
      range: "-1..1 (keyboard) / -1..1 continuous (joystick)",
    },
    Trim: {
      type: "number",
      description: "Trim input as proportion",
      range: "-1..1",
    },
    VTOL: {
      type: "number",
      description: "VTOL input as proportion",
      range: "-1..1",
    },
    Throttle: {
      type: "number",
      description: "Throttle input as proportion",
      range: "0..1",
    },
    Altitude: {
      type: "number",
      description: "Aircraft altitude in meters",
      range: "-∞..∞",
    },
    AltitudeAgl: {
      type: "number",
      description: "Aircraft altitude above ground level in meters",
      range: "-∞..∞",
    },
    GS: {
      type: "number",
      description: "Ground speed (m/s)",
      range: "0..∞",
    },
    IAS: {
      type: "number",
      description: "Indicated air speed (m/s)",
      range: "0..∞",
    },
    TAS: {
      type: "number",
      description: "True air speed (m/s)",
      range: "0..∞",
    },
    Fuel: {
      type: "number",
      description: "Remaining fuel as proportion of capacity",
      range: "0..1",
    },
    AngleOfAttack: {
      type: "number",
      description: "Angle of attack (degrees)",
      range: "-180..180",
    },
    AngleOfSlip: {
      type: "number",
      description: "Angle of slip (degrees)",
      range: "-180..180",
    },
    PitchAngle: {
      type: "number",
      description: "Pitch angle of aircraft (degrees)",
      range: "-90..90",
    },
    RollAngle: {
      type: "number",
      description: "Roll angle of aircraft (degrees)",
      range: "-180..180",
    },
    Heading: {
      type: "number",
      description: "Aircraft heading (degrees)",
      range: "-180..180",
    },
    Time: {
      type: "number",
      description: "Time since level loaded (seconds)",
      range: "0..∞",
    },
    GForce: {
      type: "number",
      description: "Omnidirectional G-force on pilot",
      range: "0..∞",
    },
    VerticalG: {
      type: "number",
      description: "Vertical component of G-force",
      range: "0..∞",
    },
    Latitude: {
      type: "number",
      description: "Y-position in sandbox map",
      range: "-∞..∞",
    },
    Longitude: {
      type: "number",
      description: "X-position in sandbox map",
      range: "-∞..∞",
    },
    PitchRate: {
      type: "number",
      description: "Pitch rate (deg/s)",
      range: "-∞..∞",
    },
    RollRate: {
      type: "number",
      description: "Roll rate (deg/s)",
      range: "-∞..∞",
    },
    YawRate: {
      type: "number",
      description: "Yaw rate (deg/s)",
      range: "-∞..∞",
    },
    LandingGear: {
      type: "number",
      description: "Archaic landing gear state – use GearDown instead",
      range: "0..1",
    },
    Brake: {
      type: "number",
      description: "Brake pressed (0 = no, 1 = yes)",
      range: "0..1",
    },
    TargetHeading: {
      type: "number",
      description: "Global heading of selected target (degrees, 0-360)",
      range: "0..360",
    },
    TargetElevation: {
      type: "number",
      description: "Line-of-sight angle to selected target (degrees)",
      range: "-90..90",
    },
    TargetDistance: {
      type: "number",
      description: "Distance to selected target (meters)",
      range: "0..∞",
    },

    // Boolean-type input variables
    GearDown: {
      type: "boolean",
      description: "Landing gear extended",
    },
    FireGuns: {
      type: "boolean",
      description: "Guns button pressed",
    },
    FireWeapons: {
      type: "boolean",
      description: "Fire ordnance button pressed",
    },
    LaunchCountermeasures: {
      type: "boolean",
      description: "Launch countermeasures button pressed",
    },
    Activate1: {
      type: "boolean",
      description: "Activation group 1 state",
    },
    Activate2: {
      type: "boolean",
      description: "Activation group 2 state",
    },
    Activate3: {
      type: "boolean",
      description: "Activation group 3 state",
    },
    Activate4: {
      type: "boolean",
      description: "Activation group 4 state",
    },
    Activate5: {
      type: "boolean",
      description: "Activation group 5 state",
    },
    Activate6: {
      type: "boolean",
      description: "Activation group 6 state",
    },
    Activate7: {
      type: "boolean",
      description: "Activation group 7 state",
    },
    Activate8: {
      type: "boolean",
      description: "Activation group 8 state",
    },
    TargetSelected: {
      type: "boolean",
      description: "Whether a target is selected",
    },

    // String-type input variable
    SelectedWeapon: {
      type: "string",
      description: "Name of selected weapon (e.g. 'Boom 50', 'Cannon')",
    },
  },

  functions: {
    // Number-based functions
    abs: {
      signature: "abs(x)",
      description: "Absolute (positive) value of x",
      params: ["x: number"],
      example: "abs(-5)  // returns 5",
    },
    ceil: {
      signature: "ceil(x)",
      description: "Round x up to nearest integer (away from zero for positive, toward zero for negative)",
      params: ["x: number"],
      example: "ceil(3.2)  // returns 4",
    },
    clamp: {
      signature: "clamp(x, min, max)",
      description: "Clamp value between min and max",
      params: ["x: number", "min: number", "max: number"],
      example: "clamp(Pitch * 5, -1, 1)",
    },
    clamp01: {
      signature: "clamp01(x)",
      description: "Clamp value between 0 and 1 (equivalent to clamp(x, 0, 1))",
      params: ["x: number"],
      example: "clamp01(Throttle - 0.2)",
    },
    deltaangle: {
      signature: "deltaangle(a, b)",
      description: "Smallest angle delta between angles a and b in degrees",
      params: ["a: degrees", "b: degrees"],
      example: "deltaangle(350, 10)  // returns 20",
    },
    exp: {
      signature: "exp(x)",
      description: "e raised to the power of x",
      params: ["x: number"],
      example: "exp(1)  // returns ~2.718",
    },
    floor: {
      signature: "floor(x)",
      description: "Round x down to nearest integer (toward zero for positive, away from zero for negative)",
      params: ["x: number"],
      example: "floor(3.9)  // returns 3",
    },
    inverselerp: {
      signature: "inverselerp(a, b, x)",
      description: "Calculates linear parameter t that produces interpolant value within range [a, b]",
      params: ["a: number", "b: number", "x: number"],
      example: "inverselerp(0, 100, 50)  // returns 0.5",
    },
    lerp: {
      signature: "lerp(a, b, t)",
      description: "Linear interpolation between a and b by proportion t",
      params: ["a: number", "b: number", "t: number (0..1)"],
      example: "lerp(0, 100, Throttle)",
    },
    lerpangle: {
      signature: "lerpangle(a, b, t)",
      description: "Interpolates angles correctly when crossing 360°",
      params: ["a: degrees", "b: degrees", "t: number (0..1)"],
      example: "lerpangle(350, 10, 0.5)  // returns 0",
    },
    lerpunclamped: {
      signature: "lerpunclamped(a, b, t)",
      description: "Linear interpolation without clamping t between 0 and 1",
      params: ["a: number", "b: number", "t: number"],
      example: "lerpunclamped(0, 100, 1.5)  // returns 150",
    },
    log: {
      signature: "log(x, p)",
      description: "Logarithm of x in base p",
      params: ["x: number", "p: number (>0)"],
      example: "log(100, 10)  // returns 2",
    },
    log10: {
      signature: "log10(x)",
      description: "Base-10 logarithm (log(x,10))",
      params: ["x: number"],
      example: "log10(1000)  // returns 3",
    },
    max: {
      signature: "max(a, b)",
      description: "Larger of a and b",
      params: ["a: number", "b: number"],
      example: "max(Roll, Pitch)",
    },
    min: {
      signature: "min(a, b)",
      description: "Smaller of a and b",
      params: ["a: number", "b: number"],
      example: "min(Throttle, 0.5)",
    },
    pingpong: {
      signature: "pingpong(x, l)",
      description: "Ping-pongs x so it stays between 0 and l",
      params: ["x: number", "l: number (>0)"],
      example: "pingpong(Time, 10)  // bounces between 0 and 10",
    },
    pow: {
      signature: "pow(x, p)",
      description: "x raised to the power p",
      params: ["x: number", "p: number"],
      example: "pow(2, 3)  // returns 8",
    },
    repeat: {
      signature: "repeat(x, l)",
      description: "Loops x so it stays between 0 and l (sawtooth)",
      params: ["x: number", "l: number (>0)"],
      example: "repeat(Time, 5)  // sawtooth 0..5 repeating",
    },
    round: {
      signature: "round(x)",
      description: "Rounds x to nearest integer",
      params: ["x: number"],
      example: "round(3.49)  // returns 3",
    },
    sign: {
      signature: "sign(x)",
      description: "Sign of x (1 if positive, -1 if negative, 0 if zero)",
      params: ["x: number"],
      example: "sign(PitchRate)",
    },
    smoothstep: {
      signature: "smoothstep(a, b, t)",
      description: "Hermite interpolation with smoothing at ends",
      params: ["a: number", "b: number", "t: number"],
      example: "smoothstep(0, 1, Throttle)",
    },
    sqrt: {
      signature: "sqrt(x)",
      description: "Square root of x",
      params: ["x: number (≥0)"],
      example: "sqrt(4)  // returns 2",
    },
    sin: {
      signature: "sin(x)",
      description: "Sine of x (degrees)",
      params: ["x: degrees"],
      example: "sin(Time * 90)",
    },
    cos: {
      signature: "cos(x)",
      description: "Cosine of x (degrees)",
      params: ["x: degrees"],
      example: "cos(Time * 60)",
    },
    tan: {
      signature: "tan(x)",
      description: "Tangent of x (degrees)",
      params: ["x: degrees"],
      example: "tan(45)  // returns 1",
    },
    asin: {
      signature: "asin(x)",
      description: "Arc‑sine of x (degrees)",
      params: ["x: number (-1..1)"],
      example: "asin(1)  // returns 90",
    },
    acos: {
      signature: "acos(x)",
      description: "Arc-cosine of x (degrees)",
      params: ["x: number (-1..1)"],
      example: "acos(0)  // returns 90",
    },
    atan: {
      signature: "atan(x)",
      description: "Arc-tangent of x (degrees)",
      params: ["x: number"],
      example: "atan(1)  // returns 45",
    },

    // Time-based functions
    rate: {
      signature: "rate(x)",
      description: "Derivative / rate of change of x",
      params: ["x: number"],
      example: "rate(Altitude)",
    },
    sum: {
      signature: "sum(x)",
      description: "Integral of x over time (from level load)",
      params: ["x: number"],
      example: "sum(Throttle)",
    },
    smooth: {
      signature: "smooth(x, rate)",
      description: "Follows x but limited to maximum speed 'rate' units per second",
      params: ["x: number", "rate: number (units/sec)"],
      example: "smooth(Pitch, 90)",
    },
    PID: {
      signature: "PID(target, current, p, i, d)",
      description: "PID controller output",
      params: ["target: number", "current: number", "p: proportional", "i: integral", "d: derivative"],
      example: "PID(TargetHeading, Heading, 0.1, 0.01, 0.05)",
    },

    // String-based functions
    ammo: {
      signature: 'ammo("weapon")',
      description: "Remaining ammo for named weapon",
      params: ["weapon: string"],
      example: 'ammo("Cannon")',
    },
  },

  operators: {
    math: [
      { symbol: "+", description: "Addition / string concatenation", example: "a + b", explanation: "Adds numbers or concatenates strings." },
      { symbol: "-", description: "Subtraction or negative sign", example: "a - b  or  -c", explanation: "Subtracts b from a or negates c." },
      { symbol: "*", description: "Multiplication", example: "a * b", explanation: "Multiplies a and b." },
      { symbol: "/", description: "Division", example: "a / b", explanation: "Divides a by b." },
      { symbol: "()", description: "Parentheses for grouping", example: "(a + b) * c", explanation: "Controls evaluation order." },
    ],
    comparison: [
      { symbol: "=", description: "Equality", example: "a = b", explanation: "True if a equals b." },
      { symbol: "!=", description: "Inequality", example: "a != b", explanation: "True if a does not equal b." },
      { symbol: ">", description: "Greater than", example: "a > b", explanation: "True if a is greater than b." },
      { symbol: "<", description: "Less than", example: "a < b", explanation: "True if a is less than b." },
      { symbol: ">=", description: "Greater than or equal", example: "a >= b", explanation: "True if a ≥ b." },
      { symbol: "<=", description: "Less than or equal", example: "a <= b", explanation: "True if a ≤ b." },
    ],
    boolean: [
      { symbol: "&", description: "Logical AND", example: "a & b", explanation: "True only if both a and b are true." },
      { symbol: "|", description: "Logical OR", example: "a | b", explanation: "True if at least one of a, b is true." },
      { symbol: "!", description: "Logical NOT", example: "!a", explanation: "Inverts boolean value: !true → false." },
    ],
    ternary: [
      { 
        symbol: "?", 
        description: "Conditional selection", 
        example: "condition ? valueIfTrue : valueIfFalse", 
        explanation: "If condition is true, returns valueIfTrue; otherwise returns valueIfFalse." 
      },
      { 
        symbol: ":", 
        description: "Conditional selection", 
        example: "condition ? valueIfTrue : valueIfFalse", 
        explanation: "If condition is true, returns valueIfTrue; otherwise returns valueIfFalse." 
      },
    ],
  },

  misc: {
    debugger: {
      command: "DebugExpression \"expression\"",
      note: "Use ## instead of \"\" inside expression. Clear with ClearDebugExpressions.",
    },
    editor: "Atom.io recommended for syntax highlighting and parenthesis matching.",
  },
};