case maybe of
    Just a -> b
    Nothing -> lala

func "a" = lnavlnvav
func "bajvjanla" = ajnvlavnl

toDiagram
    :: (MonadIO m) -- Required for 
    => Renderable a -- The chart that needs to be converted, normally this type will be Renderable ()
    -> m (QDiagram B V2 Double Any) -- B stands for the backend in scope

toDiagram
    :: (MonadIO m)                  -- Required for defaultEnv, it caches the default environment
    => Renderable a                 -- The chart that needs to be converted, normally this type will be Renderable ()
    -> Double                       -- Width
    -> Double                       -- Height
    -> m (Diagram B) -- B stands for the backend in scope

check xs
    | length xs == 2 = xs
    | otherwise = add xs
