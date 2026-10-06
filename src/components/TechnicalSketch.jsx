import { useState } from 'react';
import { technicalSketchById } from '../data/technicalSketches.js';

const points = Object.freeze({
  vcc: { x: 250, y: 34 },
  pull: { x: 250, y: 105 },
  input: { x: 250, y: 180 },
  driver: { x: 250, y: 255 },
  gnd: { x: 250, y: 326 },
});

const activeClass = (active) => (
  active ? 'sketch-stroke sketch-active' : 'sketch-stroke'
);

function RailPrimitive({ primitive, activeStepId }) {
  const active = activeStepId === 'off' || activeStepId === 'on';
  return (
    <g className="sketch-primitive">
      <line className={activeClass(active)} vectorEffect="non-scaling-stroke" x1="190" y1={points.vcc.y} x2="310" y2={points.vcc.y} />
      <line className={activeClass(active)} vectorEffect="non-scaling-stroke" x1={points.vcc.x} y1={points.vcc.y} x2={points.vcc.x} y2="67" />
      <text x="326" y="40">{primitive.label}</text>
    </g>
  );
}

function ResistorPrimitive({ primitive, activeStepId }) {
  const active = activeStepId === 'off' || activeStepId === 'on';
  return (
    <g className="sketch-primitive">
      <path
        className={activeClass(active)}
        vectorEffect="non-scaling-stroke"
        d="M 250 67 l -13 10 l 26 13 l -26 13 l 26 13 l -26 13 l 13 10 L 250 180"
      />
      <text x="278" y="111">{primitive.label}</text>
      <text className="sketch-note" x="278" y="132">weak path</text>
    </g>
  );
}

function JunctionPrimitive({ primitive, activeStepId }) {
  return (
    <g className="sketch-primitive">
      <circle className="sketch-stroke" vectorEffect="non-scaling-stroke" cx={points.input.x} cy={points.input.y} r="4" />
      <line className="sketch-stroke" vectorEffect="non-scaling-stroke" x1={points.input.x} y1={points.input.y} x2="420" y2={points.input.y} />
      <path className={activeClass(activeStepId === 'off')} vectorEffect="non-scaling-stroke" d="M 420 180 l -12 -7 m 12 7 l -12 7" />
      <text x="438" y="186">{primitive.label}</text>
      <text className="sketch-value" x="438" y="211">
        {activeStepId === 'on' ? '≈ 0 V · LOW' : '≈ 3.3 V · HIGH'}
      </text>
    </g>
  );
}

function OpenDrainPrimitive({ primitive, activeStepId }) {
  const isOn = activeStepId === 'on';
  return (
    <g className="sketch-primitive">
      <line className={activeClass(isOn)} vectorEffect="non-scaling-stroke" x1={points.input.x} y1={points.input.y} x2={points.driver.x} y2="224" />
      <circle className={activeClass(isOn)} vectorEffect="non-scaling-stroke" cx={points.driver.x} cy={points.driver.y} r="30" />
      <line className={activeClass(isOn)} vectorEffect="non-scaling-stroke" x1="238" y1="238" x2="262" y2="270" />
      {!isOn && <line className="sketch-stroke sketch-switch-gap" vectorEffect="non-scaling-stroke" x1="238" y1="238" x2="252" y2="257" />}
      <line className={activeClass(isOn)} vectorEffect="non-scaling-stroke" x1={points.driver.x} y1="285" x2={points.gnd.x} y2="307" />
      <text x="302" y="252">{primitive.label}</text>
      <text className="sketch-note" x="302" y="274">
        {isOn ? 'conducting · strong path' : 'off · path open'}
      </text>
    </g>
  );
}

function GroundPrimitive({ primitive, activeStepId }) {
  return (
    <g className="sketch-primitive">
      <line className={activeClass(activeStepId === 'on')} vectorEffect="non-scaling-stroke" x1={points.gnd.x} y1="307" x2={points.gnd.x} y2="316" />
      <line className="sketch-stroke" vectorEffect="non-scaling-stroke" x1="225" y1="316" x2="275" y2="316" />
      <line className="sketch-stroke" vectorEffect="non-scaling-stroke" x1="233" y1="325" x2="267" y2="325" />
      <line className="sketch-stroke" vectorEffect="non-scaling-stroke" x1="242" y1="334" x2="258" y2="334" />
      <text x="285" y="331">{primitive.label}</text>
    </g>
  );
}

function SketchPrimitive({ primitive, activeStepId }) {
  const props = { primitive, activeStepId };
  switch (primitive.type) {
    case 'rail': return <RailPrimitive {...props} />;
    case 'resistor': return <ResistorPrimitive {...props} />;
    case 'junction': return <JunctionPrimitive {...props} />;
    case 'open-drain': return <OpenDrainPrimitive {...props} />;
    case 'ground': return <GroundPrimitive {...props} />;
    default: return null;
  }
}

function AnnotatedFlowSketch({ sketch }) {
  const nodesById = new Map(sketch.nodes.map((node) => [node.id, node]));

  return (
    <g className="annotated-flow">
      <defs>
        <marker id={`${sketch.id}-arrow`} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path className="flow-arrowhead" d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
      </defs>
      {sketch.edges.map((edge) => {
        const from = nodesById.get(edge.from);
        const to = nodesById.get(edge.to);
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              className={edge.accent ? 'sketch-stroke sketch-active' : 'sketch-stroke'}
              markerEnd={`url(#${sketch.id}-arrow)`}
              vectorEffect="non-scaling-stroke"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
            {edge.label && (
              <text className="flow-edge-label" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 9}>
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
      {sketch.nodes.map((node) => (
        <g className="flow-node" key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <rect className={node.accent ? 'flow-node-box sketch-active' : 'flow-node-box'} x="-78" y="-34" width="156" height="68" rx="5" />
          <text className="flow-node-label" textAnchor="middle" y="-3">{node.label}</text>
          {node.note && <text className="flow-node-note" textAnchor="middle" y="17">{node.note}</text>}
        </g>
      ))}
    </g>
  );
}

export default function TechnicalSketch({ sketchId }) {
  const sketch = technicalSketchById.get(sketchId);
  const [stepIndex, setStepIndex] = useState(0);
  if (!sketch) return null;

  const step = sketch.steps?.[stepIndex];
  const titleId = `${sketch.id}-title`;
  const descriptionId = `${sketch.id}-description`;

  return (
    <figure className="technical-sketch">
      <p className="sketch-question">{sketch.question}</p>
      <svg viewBox="0 0 720 360" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{sketch.title}</title>
        <desc id={descriptionId}>{sketch.description}</desc>
        {sketch.layout === 'annotated-flow'
          ? <AnnotatedFlowSketch sketch={sketch} />
          : sketch.primitives.map((primitive) => (
            <SketchPrimitive key={primitive.id} primitive={primitive} activeStepId={step?.id} />
          ))}
      </svg>

      {step && (
        <figcaption className="sketch-explanation">
          <span className="sketch-step">Step {stepIndex + 1}/{sketch.steps.length}</span>
          <strong>{step.action}</strong>
          <p>{step.reason}</p>
          <p><b>Still true:</b> {step.invariant}</p>
          <p><b>Result:</b> {step.result}</p>
          <div className="sketch-controls">
            <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>Previous</button>
            <button type="button" disabled={stepIndex === sketch.steps.length - 1} onClick={() => setStepIndex((value) => value + 1)}>Next</button>
          </div>
        </figcaption>
      )}

      <details className="sketch-text-equivalent">
        <summary>Read the diagram as text</summary>
        <p>{sketch.textEquivalent}</p>
      </details>
    </figure>
  );
}
