// Prosta gamatyka do zapytan ala google
// od:12.01.2022 do:31.12.2024 faktura vat "ATX 345" mdrzazga@wp.pl -proforma -{rachunki bez pokrycia}
// gramatyka negaycji  - 'ale nie' wykometowana 
// ==========================



Start 
 = Grupa1|..,_|
 
Grupa1
	=  Od / Do / Moje
    / $('"' Slowa '"') 
//    / NegGr
//    / Neg
    / Slowo
    

Neg 
	= "-" lab:Slowo {return {"neg":lab}}

NegGr
  = "-{" lab:Slowa "}" {return {"neg":lab}}
    
Slowa
	= $Slowo|..,_|
    
Slowo
	//  = $([a-z0-9ćłśźżóąę]i+[a-z0-9ćłśźżóąę!@#$&*,_./:()-]i*)
	// = $([^ \t\n\r{}"]+)
    = $([^ \t\n\r"]+)

_ "whitespace"
  = [ \t\n\r]*
  
Od
 = "od:" lab:$[0-9,-.]+ {return {"od":lab}}
Do
 = "do:" lab:$[0-9,-.]+  {return {"do":lab}}
Moje
 = "moje:" {return {"moje":true}}