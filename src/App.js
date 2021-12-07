import React, { useEffect, useRef, useState } from "react";
import {
  interval,
  Subject,
  takeUntil,
  buffer,
  fromEvent,
  filter,
  tap,
  map,
  debounceTime,
} from "rxjs";
import setTimeFormat from "./utils/helpers";

function useObservable(ref, event) {
  const [subject$, setSubject$] = useState();
  useEffect(() => {
    if (!ref.current) return;
    setSubject$(fromEvent(ref.current, event));
  }, [ref, event]);
  return subject$;
}

function useClick(mouseClicks$, setState) {
  useEffect(() => {
    if (!mouseClicks$) return;
    const subject$ = mouseClicks$
      .pipe(
        buffer(mouseClicks$.pipe(debounceTime(300))),
        tap((e) => console.log(e)),
        map((e) => e.length),
        filter((e) => e === 2)
      )
      .subscribe((e) => setState(false));
    return () => subject$.unsubscribe();
  }, [mouseClicks$, setState]);
}

const App = () => {
  const [state, setState] = useState(false);
  const [time, setTime] = useState(0);

  const ref = useRef(null);
  const mouseClicks$ = useObservable(ref, "click");
  useClick(mouseClicks$, setState, state);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unsubscribe$ = new Subject();
  const timer$ = interval(1000).pipe(takeUntil(unsubscribe$));

  useEffect(() => {
    timer$.subscribe(() => {
      if (state) {
        setTime((val) => val + 1);
      }
    });

    return () => {
      unsubscribe$.next();
      unsubscribe$.complete();
    };
  }, [state, timer$, unsubscribe$]);

  function startHandler() {
    setState(true);
  }

  function stopHandler() {
    setTime(0);
    setState(false);
  }

  function resetHandler() {
    setTime(0);
  }

  return (
    <>
      <header className="header">
        <h1 className="stopwatch headline">StopWatch</h1>
        <h1 className="stopwatch indicator">{setTimeFormat(time)}</h1>
      </header>
      <section className="main">
        <div className="container">
          <button
            type="button"
            className="button is-dark"
            onClick={startHandler}
          >
            Start
          </button>
          <button
            type="button"
            className="button is-dark"
            onClick={stopHandler}
          >
            Stop
          </button>
          <button
            type="button"
            className="button is-dark"
            onClick={resetHandler}
          >
            Reset
          </button>
          <button type="button" className="button is-dark" ref={ref}>
            Wait
          </button>
        </div>
      </section>
    </>
  );
};

export default App;
