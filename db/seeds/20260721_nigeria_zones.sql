-- Remap any leftover US demo zones/locations to Nigerian corridors
alter table driver_profiles alter column zone set default 'Lagos Mainland';
alter table fleet_operator_profiles alter column zone set default 'Lagos Mainland';

update driver_profiles set
  zone = case zone
    when 'DFW North' then 'Lagos Mainland'
    when 'DFW Central' then 'Ikeja / Airport'
    when 'DFW East' then 'Lagos Island'
    when 'Houston Inner' then 'Lagos Mainland'
    when 'Houston Port' then 'Port Harcourt'
    when 'San Antonio' then 'Abuja'
    else zone
  end,
  updated_at = now()
where zone in ('DFW North', 'DFW Central', 'DFW East', 'Houston Inner', 'Houston Port', 'San Antonio');

update fleet_operator_profiles set
  zone = case zone
    when 'DFW North' then 'Lagos Mainland'
    when 'DFW Central' then 'Ikeja / Airport'
    when 'DFW East' then 'Lagos Island'
    when 'Houston Inner' then 'Lagos Mainland'
    when 'Houston Port' then 'Port Harcourt'
    when 'San Antonio' then 'Abuja'
    else zone
  end,
  updated_at = now()
where zone in ('DFW North', 'DFW Central', 'DFW East', 'Houston Inner', 'Houston Port', 'San Antonio');

update driver_shifts set
  zone = case zone
    when 'DFW North' then 'Lagos Mainland'
    when 'DFW Central' then 'Ikeja / Airport'
    when 'DFW East' then 'Lagos Island'
    when 'Houston Inner' then 'Lagos Mainland'
    when 'Houston Port' then 'Port Harcourt'
    when 'San Antonio' then 'Abuja'
    else zone
  end,
  updated_at = now()
where zone in ('DFW North', 'DFW Central', 'DFW East', 'Houston Inner', 'Houston Port', 'San Antonio');
